// everything about the user
const executeQuery = require("../utils/ExecuteQuery");
const getAllUserDetails = require("../utils/helperFunctions/getAllUserDetails");
const makeFullName = require("../utils/helperFunctions/makeFullName");
const getUserID = require("../utils/helperFunctions/getUserID");

module.exports.redirectToProfile = (req, res) => {
  const { username } = req.params;
  res.redirect(`/users/${username}/profile`);
};

module.exports.renderProfilePage = async (req, res) => {
  const { username } = req.params;
  const user = await getAllUserDetails(username);

  res.render("users/profile", {
    user: user,
  });
};

module.exports.solveEditUser = async (req, res) => {
  const { username } = req.params;
  const images = req.files;
  const { firstName, lastName, email, bio } = req.body;

  const fullname = makeFullName(firstName, lastName);

  //verify email in form
  let queryUpdateUser;
  if (!email) {
    queryUpdateUser = `UPDATE users
    SET full_name = '${fullname}', email = DEFAULT
    WHERE username = '${username}'`;
  } else {
    queryUpdateUser = `UPDATE users
    SET full_name = '${fullname}', email = '${email}'
    WHERE username = '${username}'`;
  }
  await executeQuery(queryUpdateUser);

  //verify bio existence
  const bioQuery = await executeQuery(
    `select bio_text from bios where user_id = (select user_id from users where username = '${username}')`
  );
  if (bioQuery.rows.length) {
    if (!bio) {
      await executeQuery(
        `delete from bios where user_id = (select user_id from users where username = '${username}')`
      );
    } else {
      await executeQuery(
        `update bios set bio_text = '${bio}' where user_id = (select user_id from users where username = '${username}')`
      );
    }
  } else {
    if (bio) {
      const userId = await getUserID(username);
      await executeQuery(`insert into bios values (${userId}, '${bio}')`);
    }
  }

  //verify image uploaded in form
  if (Object.keys(images).length) {
    if (images.profileImage) {
      await executeQuery(
        `update userprofile_images set img_src = '${images.profileImage[0].path}' where user_id = (select user_id from users where username = '${username}')`
      );
    }
    if (images.backgroundImage) {
      await executeQuery(
        `update userbackground_images set img_src = '${images.backgroundImage[0].path}' where user_id = (select user_id from users where username = '${username}')`
      );
    }
  }

  req.flash("success", "Successfully updated your profile!");
  res.redirect(`/users/${username}`);
};

module.exports.solveDeleteUser = async (req, res) => {
  const { username } = req.params;

  const getAllProducedSongsQuery = `select song_id from artist_lists where user_id = (select user_id from users where username = '${username}')`;
  const producedSongsResult = await executeQuery(getAllProducedSongsQuery);
  if (producedSongsResult) {
    if (producedSongsResult.rows.length) {
      for (let row of producedSongsResult.rows) {
        const songId = row[0];
        const getArtistsQuery = `select user_id from artist_lists where song_id = ${songId}`;
        const artistsResult = await executeQuery(getArtistsQuery);
        if (artistsResult) {
          if (artistsResult.rows.length == 1) {
            await executeQuery(`delete from songs where song_id = ${songId}`);
          }
        } else {
          req.flash(
            "error",
            "An error occured while trying to delete the songs.."
          );
          return res.redirect("/login");
        }
      }
    }
  } else {
    req.flash("error", "An error occured while trying to delete the songs..");
    return res.redirect("/login");
  }

  const likedSongsQuery = `select song_id from song_likes where user_id = (Select user_id from users where username = '${username}')`;
  const likedSongsResult = await executeQuery(likedSongsQuery);
  if (!likedSongsResult) {
    req.flash("error", "An error occured while trying to access the DB");
    return res.redirect("/discover");
  }
  if (likedSongsResult.rows.length) {
    for (let row of likedSongsResult.rows) {
      const songId = row[0];
      const songLikeCountResult = await executeQuery(
        `select likes from songs where song_id = ${songId}`
      );
      const songLikeCount = songLikeCountResult.rows[0][0];

      await executeQuery(
        `update songs set likes = ${
          songLikeCount - 1
        } where song_id = ${songId}`
      );
    }
  }

  const deleteQuery = `delete from users where username = '${username}'`;
  const result = await executeQuery(deleteQuery);
  if (!result) {
    req.flash("error", "Oops! An error has occured. Try again!");
    res.redirect(`/users/${username}`);
  }
  req.flash("success", "Successfully deleted the acount!");
  res.redirect("/login");
};

module.exports.renderEditUserForm = async (req, res) => {
  const { username } = req.params;

  const userQuery = `select u.full_name, u.email
    from users u
    where u.user_id = 
    (select user_id from users where username = '${username}')`;

  const userBioQuery = `select bio_text from bios where user_id = (select user_id from users where username = '${username}')`;

  const userData = await executeQuery(userQuery);
  const userDetails = userData.rows[0];

  const fullname = userData.rows[0][0];
  const firstName = fullname
    .split(" ")
    .slice(0, fullname.split(" ").length - 1)
    .join(" ");
  const lastName = fullname
    .split(" ")
    .slice(fullname.split(" ").length - 1)
    .join();

  const user = {
    firstName: firstName,
    lastName: lastName,
    username: username,
    email: userDetails[1],
  };

  const result = await executeQuery(userBioQuery);
  if (!result.rows.length) {
    user.bio = "";
  } else {
    user.bio = result.rows[0][0];
  }

  res.render("users/edit", { user: user });
};
