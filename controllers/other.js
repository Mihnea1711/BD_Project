//discover / upload
const executeQuery = require("../utils/ExecuteQuery");
const createSongsObject = require("../utils/helperFunctions/createSongsObject");
const getUserID = require("../utils/helperFunctions/getUserID");

//----------------------------------------------------------RENDER DISCOVER-------------------------------------------------------------------
module.exports.renderDiscoverPage = async (req, res) => {
  //get all songs from db
  const userSongsQuery = `select u.full_name, u.username, s.song_id, s.title, s.genre, s.duration, si.img_src 
      from users u, songs s, artist_lists al, song_images si
      where al.user_id = u.user_id and al.song_id = s.song_id and s.song_id = si.song_id order by s.title, u.username`;

  let songs = {};
  let likedSongs = [];
  let users = [];

  const allSongsResult = await executeQuery(userSongsQuery);
  if (allSongsResult) {
    songs = createSongsObject(allSongsResult);

    //get all current user's liked songs from db
    const likedSongsQuery = `select s.title, s.genre, si.img_src
        from songs s, song_images si
        where s.song_id IN (
            select sl.song_id
            from song_likes sl
            where sl.user_id = (select user_id from users where username = '${req.session.username}')
        ) and s.song_id = si.song_id`;
    const likedSongsRes = await executeQuery(likedSongsQuery);
    if (likedSongsRes) {
      if (likedSongsRes.rows.length) {
        likedSongsRes.rows.forEach((likedSong) => {
          likedSongs.push({
            title: likedSong[0],
            genre: likedSong[1],
            image: likedSong[2],
          });
        });
      }
    }
  }

  //get all users from db
  const userResult = await executeQuery(
    `select u.username, u.full_name, upi.img_src from users u, userprofile_images upi where u.user_id = upi.user_id`
  );
  const users_nr = userResult ? userResult.rows.length : 0;

  for (let i = 0; i < users_nr; i++) {
    users.push({
      username: userResult.rows[i][0],
      fullname: userResult.rows[i][1],
      profileImage: userResult.rows[i][2],
    });
  }

  res.render("others/discover", {
    songs: songs,
    users: users.slice(0, users.length % 5),
    likedSongs: likedSongs.slice(0, likedSongs.length % 5),
  });
};

//----------------------------------------------------------RENDER UPLOAD-------------------------------------------------------------------
module.exports.renderUploadPage = (req, res) => {
  res.render("others/upload");
};

//----------------------------------------------------------SOLVE UPLOAD-------------------------------------------------------------------
module.exports.uploadSong = async (req, res) => {
  //get variables
  const { songTitle, songGenre, songDuration, songLink } = req.body;
  const songImagePath = req.file ? req.file.path : "";
  const songBPM = req.body.songBPM >= 50 ? req.body.songBPM : "DEFAULT";
  const featuredArtists = !req.body.featured
    ? ""
    : req.body.featured.split(",").map((username) => username.trim());

  //get currentUser id
  const userId = await getUserID(req.session.username);

  const nextvalQuery =
    "select songs_song_id_seq.nextval, songs_song_id_seq.currval from dual";
  const rez = await executeQuery(nextvalQuery);
  const song_nextval = rez.rows[0][0];
  const song_currval = rez.rows[0][1];

  const songInsertQuery = `insert into songs values (${song_nextval}, '${songTitle}', '${songGenre}', ${songDuration}, 0, ${songBPM}, '${songLink}', SYSDATE)`;
  const artistInsertQuery = `insert into artist_lists values (artist_lists_id_seq.nextval, ${userId}, ${song_currval})`;

  let imageInsertQuery;
  if (songImagePath) {
    imageInsertQuery = `insert into song_images values (${song_currval}, '${songImagePath}')`;
  } else {
    imageInsertQuery = `insert into song_images values (${song_currval}, DEFAULT)`;
  }

  if (userId && song_nextval && song_currval) {
    executeQuery(songInsertQuery)
      .then((result) => {
        if (!result) {
          req.flash(
            "error",
            "An error occured while trying to upload the song.. Try again!"
          );
          return res.redirect("/upload");
        }

        return executeQuery(artistInsertQuery);
      })
      .then((result) => {
        if (!result) {
          req.flash(
            "error",
            "An error occured while trying to upload the song.. Try again!"
          );
          return res.redirect("/upload");
        }

        return new Promise(async (resolve, reject) => {
          if (featuredArtists.length) {
            for (let artistUsername of featuredArtists) {
              const artistUserId = await getUserID(artistUsername);
              await executeQuery(
                `insert into artist_lists values (artist_lists_id_seq.nextval, ${artistUserId}, ${song_currval})`
              );
            }
          }
          resolve("Artists inserted...");
        });
      })
      .then((result) => {
        if (result) return executeQuery(imageInsertQuery);
        else {
          req.flash(
            "error",
            "An error occured while trying to upload the image.. Try again!"
          );
          return res.redirect("/upload");
        }
      })
      .then((result) => {
        if (result) {
          req.flash("success", "Successfully added the song...");
          return res.redirect("/discover");
        } else {
          req.flash(
            "error",
            "An error occured while completing the uploading process.. Try again!"
          );
          return res.redirect("/upload");
        }
      });
  }
};
