const executeQuery = require("./utils/ExecuteQuery");
const getUserID = require("./utils/helperFunctions/getUserID");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }
  next();
};

module.exports.isOwner = (req, res, next) => {
  const { username } = req.params;
  if (username !== req.session.username) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/discover`);
  }
  next();
};

module.exports.isCommentOwner = async (req, res, next) => {
  const { username, track_id } = req.params;
  const commentId = req.query.q;

  const getCommentOwnerId = `select user_id from user_comments where id = ${commentId}`;
  const commentOwnerId = await executeQuery(getCommentOwnerId);

  if (!commentOwnerId) {
    req.flash(
      "error",
      "An error occured while trying to reach the DB.. Try again!"
    );
    return res.redirect("/discover");
  }
  if (!commentOwnerId.rows.length) {
    req.flash("error", "User does not exist!");
    return res.redirect("/discover");
  }

  const currentUserId = await getUserID(req.session.username);
  if (commentOwnerId.rows[0][0] !== currentUserId) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/users/${username}/tracks/${track_id}`);
  }

  next();
};

module.exports.userExist = async (req, res, next) => {
  const { username } = req.params;
  const checkQuery = `select * from users where username = '${username}'`;
  const checkResult = await executeQuery(checkQuery);
  if (!checkResult) {
    req.flash(
      "error",
      "An error occured while trying to reach the DB.. Try again!"
    );
    return res.redirect("/discover");
  }
  if (!checkResult.rows.length) {
    req.flash("error", "User does not exist!");
    return res.redirect("/discover");
  }
  next();
};

module.exports.songExist = async (req, res, next) => {
  const { track_id } = req.params;
  const checkQuery = `select * from songs where song_id = ${track_id}`;
  const checkResult = await executeQuery(checkQuery);
  if (!checkResult) {
    req.flash(
      "error",
      "An error occured while trying to reach the DB.. Try again!"
    );
    return res.redirect("/discover");
  }
  if (!checkResult.rows.length) {
    req.flash("error", "Song does not exist!");
    return res.redirect("/discover");
  }
  next();
};

module.exports.playlistExist = async (req, res, next) => {
  const { username } = req.params;
  const checkQuery = `select * from users where username = '${username}'`;
  const checkResult = await executeQuery(checkQuery);
  if (!checkResult) {
    req.flash(
      "error",
      "An error occured while trying to reach the DB.. Try again!"
    );
    return res.redirect("/discover");
  }
  if (!checkResult.rows.length) {
    req.flash("error", "User does not exist!");
    return res.redirect("/discover");
  }
  next();
};

module.exports.commentExist = async (req, res, next) => {
  const commentId = req.query.q;
  const checkQuery = `select * from user_comments where id = ${commentId}`;
  const checkResult = await executeQuery(checkQuery);
  if (!checkResult) {
    req.flash(
      "error",
      "An error occured while trying to reach the DB.. Try again!"
    );
    return res.redirect("/discover");
  }
  if (!checkResult.rows.length) {
    req.flash("error", "Comment does not exist!");
    return res.redirect("/discover");
  }
  next();
};
