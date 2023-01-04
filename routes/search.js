const express = require("express");

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const searchController = require("../controllers/search");

const router = express.Router();

router
  .route("/")
  .get(isLoggedIn, searchController.renderSearchAllPage)
  .post(isLoggedIn, searchController.solveSearchButton);

router
  .route("/tracks")
  .get(isLoggedIn, wrapAsync(searchController.renderSearchTracksPage));

router
  .route("/people")
  .get(isLoggedIn, wrapAsync(searchController.renderSearchPeoplePage));

router
  .route("/playlists")
  .get(isLoggedIn, wrapAsync(searchController.renderSearchPlaylistsPage));

module.exports = router;
