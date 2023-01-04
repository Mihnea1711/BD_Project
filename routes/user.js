const express = require("express");
const multer = require("multer");

const wrapAsync = require("../utils/wrapAsync");
const { storage } = require("../cloudinary");
const {
  isLoggedIn,
  userExist,
  isOwner,
  songExist,
  commentExist,
  isCommentOwner,
  playlistExist,
} = require("../middleware");

const userController = require("../controllers/user");
const songController = require("../controllers/song");
const playlistController = require("../controllers/playlist");

const editProfile = multer({ storage });
const createPlaylist = multer({ storage });
const editPlaylist = multer({ storage });
const editSong = multer({ storage });
const router = express.Router();

//--------------------------------------------USER ROUTES------------------------------------------------------------------------
//<= user-ul curent va vedea pagina ca "/username"
//aici punem fiecare ruta legata de useri

router
  .route("/:username")
  .get(isLoggedIn, userExist, userController.redirectToProfile);

router
  .route("/:username/profile")
  .get(isLoggedIn, userExist, wrapAsync(userController.renderProfilePage))
  .put(
    isLoggedIn,
    userExist,
    isOwner,
    editProfile.fields([
      { name: "profileImage", maxCount: 1 },
      { name: "backgroundImage", maxCount: 1 },
    ]),
    wrapAsync(userController.solveEditUser)
  )
  .delete(
    isLoggedIn,
    userExist,
    isOwner,
    wrapAsync(userController.solveDeleteUser)
  );

router
  .route("/:username/profile/edit")
  .get(
    isLoggedIn,
    userExist,
    isOwner,
    wrapAsync(userController.renderEditUserForm)
  );

router
  .route("/:username/tracks")
  .get(isLoggedIn, userExist, wrapAsync(songController.renderAllUserTracks));

router
  .route("/:username/tracks/:track_id")
  .get(
    isLoggedIn,
    userExist,
    songExist,
    wrapAsync(songController.renderUserTrack)
  )
  .post(
    isLoggedIn,
    userExist,
    songExist,
    wrapAsync(songController.addUserComment)
  )
  .put(
    isLoggedIn,
    userExist,
    songExist,
    isOwner,
    editSong.single("songImage"),
    wrapAsync(songController.solveEditSong)
  )
  .delete(
    isLoggedIn,
    userExist,
    songExist,
    isOwner,
    wrapAsync(songController.solveDeleteSong)
  );

router
  .route("/:username/tracks/:track_id/likeSong")
  .post(
    isLoggedIn,
    userExist,
    songExist,
    wrapAsync(songController.solveLikeSong)
  );

router
  .route("/:username/tracks/:track_id/deleteComment")
  .post(
    isLoggedIn,
    userExist,
    songExist,
    commentExist,
    isCommentOwner,
    wrapAsync(songController.solveDeleteComment)
  );

router
  .route("/:username/tracks/:track_id/edit")
  .get(
    isLoggedIn,
    userExist,
    songExist,
    isOwner,
    wrapAsync(songController.renderSongEditForm)
  );

router
  .route("/:username/playlists")
  .get(isLoggedIn, userExist, wrapAsync(playlistController.renderUserPlaylists))
  .post(
    isLoggedIn,
    userExist,
    isOwner,
    createPlaylist.single("playlistImage"),
    wrapAsync(playlistController.solveCreatePlaylist)
  );

router
  .route("/:username/playlists/show")
  .get(
    isLoggedIn,
    userExist,
    wrapAsync(playlistController.renderUserAvailablePlaylists)
  )
  .post(
    isLoggedIn,
    userExist,
    wrapAsync(playlistController.solveAddToSelectedPlaylist)
  );

router
  .route("/:username/playlists/create")
  .get(
    isLoggedIn,
    userExist,
    isOwner,
    playlistController.renderCreatePlaylistForm
  );

router
  .route("/:username/playlists/:playlist_id")
  .get(
    isLoggedIn,
    userExist,
    playlistExist,
    wrapAsync(playlistController.renderPlaylistContent)
  )
  .put(
    isLoggedIn,
    userExist,
    playlistExist,
    isOwner,
    editPlaylist.single("playlistImage"),
    wrapAsync(playlistController.solveEditPlaylist)
  )
  .delete(
    isLoggedIn,
    userExist,
    playlistExist,
    isOwner,
    wrapAsync(playlistController.solveDeletePlaylist)
  );

router
  .route("/:username/playlists/:playlist_id/edit")
  .get(
    isLoggedIn,
    userExist,
    playlistExist,
    isOwner,
    wrapAsync(playlistController.renderEditPlaylistForm)
  );

router
  .route("/:username/playlists/:playlist_id/remove/:track_id")
  .delete(
    isLoggedIn,
    userExist,
    playlistExist,
    songExist,
    isOwner,
    wrapAsync(playlistController.solveRemoveSongFromPlaylist)
  );

router
  .route("/:username/likes")
  .get(isLoggedIn, userExist, wrapAsync(songController.renderLikedSongs));

module.exports = router;
