if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const oracledb = require("oracledb");
const dbConfig = require("../utils/dbConfig");

const userQueries = require("./users/seedUsers");
const bioQueries = require("./users/seedBios");
const artistListQueries = require("./M2M/seedArtistLists");
const userProfileImgQueries = require("./users/seedUserProfileImages");
const userProfileBkgQueries = require("./users/seedUserBkgImages");
const userCommentsQueries = require("./M2M/seedUserComments");

const songQueries = require("./songs/seedSongs");
const songImgQueries = require("./songs/seedSongImages");
const songLikesQueries = require("./M2M/seedSongLikes");

const playlistQueries = require("./playlists/seedPlaylists");
const playlistImageQueries = require("./playlists/seedPlaylistImages");
const playlistSongsQueries = require("./M2M/seedPlaylistSongs");

const redoSequences = require("./recreate_Seq");

oracledb.autoCommit = true;
if (process.platform === "win32") {
  // Windows
  oracledb.initOracleClient({
    libDir: "D:\\Code\\VS_Code\\instantclient_21_7",
  });
}

const seedDB = async (query, tablename) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    if (connection) {
      console.log("Deleted everything in " + tablename);
      for (let stmt of query) {
        await connection.execute(stmt);
      }
      console.log("Done with " + tablename);
      return new Promise((resolve) => setTimeout(resolve, 3000));
    }
  } catch (err) {
    console.log("Error Connecting to DB");
    console.log(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.log("Error");
      }
    }
  }
};

seedDB(redoSequences, "SEQUENCES").then(() =>
  seedDB(userQueries, "USERS")
    .then(() => seedDB(bioQueries, "BIOS"))
    .then(() => seedDB(userProfileImgQueries, "USERPROFILE_IMAGES"))
    .then(() => seedDB(userProfileBkgQueries, "USERBACKGROUND_IMAGES"))
    .then(() => seedDB(songQueries, "SONGS"))
    .then(() => seedDB(songImgQueries, "SONG_IMAGES"))
    .then(() => seedDB(playlistQueries, "PLAYLISTS"))
    .then(() => seedDB(playlistImageQueries, "PLAYLIST_IMAGES"))
    .then(() => seedDB(artistListQueries, "ARTIST_LISTS"))
    .then(() => seedDB(playlistSongsQueries, "PLAYLIST_SONGS"))
    .then(() => seedDB(songLikesQueries, "SONG_LIKES"))
    .then(() => seedDB(userCommentsQueries, "USER_COMMENTS"))
);
