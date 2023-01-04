const executeQuery = require("../utils/ExecuteQuery");
const createSongsObject = require("../utils/helperFunctions/createSongsObject");
const getAllUserDetails = require("../utils/helperFunctions/getAllUserDetails");
const getAllSongDetails = require("../utils/helperFunctions/getAllSongDetails");
const getUserID = require("../utils/helperFunctions/getUserID");
const getFormattedDuration = require("../utils/helperFunctions/getFormattedDuration");

//everything about the song
module.exports.renderAllUserTracks = async (req, res) => {
  //render the user uploaded tracks
  const { username } = req.params;
  const user = await getAllUserDetails(username);

  const query = `select u.full_name, u.username, s.song_id, s.title, s.genre, s.duration, si.img_src 
      from users u, songs s, artist_lists al, song_images si 
      where al.song_id = s.song_id and s.song_id = si.song_id and al.user_id = (select user_id from users where username = '${username}')
      order by s.title, u.username`;

  const uploadedTracksResult = await executeQuery(query);
  const songs = createSongsObject(uploadedTracksResult);

  res.render("users/tracks", {
    user: user,
    songs: songs,
  });
};

module.exports.renderUserTrack = async (req, res) => {
  //render track page
  const { username, track_id } = req.params;

  const song = await getAllSongDetails(track_id);
  const currentUserPImageQuery = `select upi.img_src from userprofile_images upi where upi.user_id = (select user_id from users where username = '${req.session.username}')`;
  const currentUserImageResult = await executeQuery(currentUserPImageQuery);
  const currentUserProfilePic = currentUserImageResult.rows[0][0];

  let isLiked = false;
  const checkIfLikedQuery = `select * from song_likes where song_id = ${track_id} and user_id = (select user_id from users where username = '${req.session.username}')`;
  const checkIfLikedResult = await executeQuery(checkIfLikedQuery);
  if (checkIfLikedResult) {
    if (checkIfLikedResult.rows.length) {
      isLiked = true;
    }
  }

  if (Object.keys(song).length) {
    song.duration = getFormattedDuration(song.duration);

    const findCommentsQuery = `select u.username, u.full_name, upi.img_src, uc.id, uc.text
    from users u, user_comments uc, userprofile_images upi
    where u.user_id = upi.user_id and u.user_id = uc.user_id and uc.song_id = ${track_id}`;

    const comments = [];
    const findCommentsResult = await executeQuery(findCommentsQuery);
    if (findCommentsResult) {
      if (findCommentsResult.rows.length) {
        for (let row of findCommentsResult.rows) {
          const username = row[0];
          const fullname = row[1];
          const userProfilePic = row[2];
          const commentId = row[3];
          const userComment = row[4];

          comments.push({
            username: username,
            fullname: fullname,
            userProfilePic: userProfilePic,
            commentId: commentId,
            userComment: userComment,
          });
        }
      }
    }

    return res.render("songs/overview", {
      username: username,
      currentUserProfilePic: currentUserProfilePic,
      song: song,
      isLiked: isLiked,
      comments: comments,
    });
  } else {
    req.flash("Track ID not found.. Try another one!");
    return res.redirect("/discover");
  }
};

module.exports.addUserComment = async (req, res) => {
  const { username, track_id } = req.params;
  const { commentText } = req.body;

  const userId = await getUserID(req.session.username);

  if (commentText) {
    const insertCommentQuery = `insert into user_comments values (user_comments_id_seq.nextval, ${userId}, ${track_id}, '${commentText}')`;
    const result = await executeQuery(insertCommentQuery);
    if (result) {
      req.flash("success", "Successfully added a comment on the song!");
    } else {
      req.flash(
        "error",
        "An error occured while posting the comment on the song.. Try again!"
      );
    }
    return res.redirect(`/users/${username}/tracks/${track_id}`);
  } else {
    req.flash("error", "Comment can't be empty or cannot be added in the DB!");
    return res.redirect(`/users/${username}/tracks/${track_id}`);
  }
};

module.exports.solveEditSong = async (req, res) => {
  const { songTitle, songGenre, songLink } = req.body;
  const { username, track_id } = req.params;
  const songImagePath = req.file ? req.file.path : "";
  const songBPM = req.body.songBPM ? req.body.songBPM : "";

  let updateSongQuery;
  let updateSongImageQuery;

  if (songBPM) {
    updateSongQuery = `update songs set title='${songTitle}', genre='${songGenre}', link='${songLink}', bpm=${songBPM}
    where song_id=${track_id}`;
  } else {
    updateSongQuery = `update songs set title='${songTitle}', genre='${songGenre}', link='${songLink}', bpm=DEFAULT
    where song_id=${track_id}`;
  }

  if (songImagePath) {
    updateSongImageQuery = `update song_images set img_src='${songImagePath}' where song_id=${track_id}`;
  }

  executeQuery(updateSongQuery).then((result) => {
    if (!result) {
      req.flash(
        "error",
        "An error occured while trying to update your song.. Try again!"
      );
      return res.redirect(`/users/${username}/tracks/${track_id}`);
    }
    if (!songImagePath) {
      req.flash("success", "Successfully updated your song!");
      return res.redirect(`/users/${username}/tracks/${track_id}`);
    }
    executeQuery(updateSongImageQuery).then((result) => {
      if (!result) {
        req.flash(
          "error",
          "An error occured while trying to update your song image.. Try again!"
        );
        return res.redirect(`/users/${username}/tracks/${track_id}`);
      }
      req.flash("success", "Successfully updated your song!");
      return res.redirect(`/users/${username}/tracks/${track_id}`);
    });
  });
};

module.exports.solveDeleteSong = async (req, res) => {
  const { username, track_id } = req.params;

  const deleteSongQuery = `delete from songs where song_id = ${track_id}`;
  const result = await executeQuery(deleteSongQuery);
  if (result) {
    req.flash("success", "Successfully deleted your song!");
  } else {
    req.flash(
      "error",
      "An error occured while trying to delete the song.. Try again!"
    );
  }
  return res.redirect(`/users/${username}/tracks`);
};

module.exports.solveLikeSong = async (req, res) => {
  const { username, track_id } = req.params;

  let isLiked = false;
  const checkIfLikedQuery = `select * from song_likes where song_id = ${track_id} and user_id = (select user_id from users where username = '${req.session.username}')`;
  const checkIfLikedResult = await executeQuery(checkIfLikedQuery);
  if (checkIfLikedResult) {
    if (checkIfLikedResult.rows.length) {
      isLiked = true;
    }
  }

  const getSongLikesQuery = `select likes from songs where song_id = ${track_id}`;
  const songLikesResult = await executeQuery(getSongLikesQuery);
  const songLikes = songLikesResult.rows[0][0];

  let toggleLikeQuery;
  let updateLikeCountQuery;

  if (isLiked) {
    toggleLikeQuery = `delete from song_likes where song_id = ${track_id} and user_id = (select user_id from users where username = '${req.session.username}')`;
    updateLikeCountQuery = `update songs set likes = ${
      songLikes - 1
    } where song_id = ${track_id}`;
  } else {
    const userId = await getUserID(req.session.username);
    toggleLikeQuery = `insert into song_likes values (song_likes_id_seq.nextval, ${userId}, ${track_id})`;
    updateLikeCountQuery = `update songs set likes = ${
      songLikes + 1
    } where song_id = ${track_id}`;
  }

  const likeResult = await executeQuery(toggleLikeQuery);
  const updateLinkeCountResult = await executeQuery(updateLikeCountQuery);
  if (likeResult && updateLinkeCountResult) {
    if (!isLiked) req.flash("success", "Successfully liked the song!");
    else req.flash("success", "Successfully disliked the song :(");
  } else {
    req.flash(
      "error",
      "An error occured while trying to like to song.. Try again!"
    );
  }
  return res.redirect(`/users/${username}/tracks/${track_id}`);
};

module.exports.solveDeleteComment = async (req, res) => {
  const { username, track_id } = req.params;
  const comment_id = req.query.q;

  const deleteQuery = `delete from user_comments where id = ${comment_id}`;
  const result = await executeQuery(deleteQuery);
  if (result) {
    req.flash("success", "Successfully deleted the comment!");
  } else {
    req.flash(
      "error",
      "An error occured while deleting the comment.. Try again!"
    );
  }
  return res.redirect(`/users/${username}/tracks/${track_id}`);
};

module.exports.renderSongEditForm = async (req, res) => {
  const { username, track_id } = req.params;
  const song = await getAllSongDetails(track_id);

  if (Object.keys(song).length) {
    return res.render("songs/edit", { username: username, song: song });
  } else {
    req.flash("Track ID not found.. Try another one!");
    return res.redirect("/discover");
  }
};

module.exports.renderLikedSongs = async (req, res) => {
  const { username } = req.params;
  const user = await getAllUserDetails(username);

  const getLikedSongsQuery = `select u.full_name, u.username, s.song_id, s.title, s.genre, s.duration, si.img_src 
  from users u, songs s, artist_lists al, song_images si
  where al.user_id = u.user_id and al.song_id = s.song_id and s.song_id = si.song_id 
  and s.song_id IN (select song_id from song_likes where user_id = (select user_id from users where username = '${username}'))
  order by s.title`;

  const likedSongsResult = await executeQuery(getLikedSongsQuery);

  const likedSongs = createSongsObject(likedSongsResult);

  res.render("users/likes", {
    user: user,
    likedSongs: likedSongs,
  });
};
