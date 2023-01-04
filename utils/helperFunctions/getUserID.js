const { user } = require("../dbConfig");
const executeQuery = require("../ExecuteQuery");
const ExpressError = require("../ExpressError");

module.exports = async (username) => {
  let userId = "";
  const userIdQuery = `select user_id from users where username = '${username}'`;
  const userResult = await executeQuery(userIdQuery);
  if (userResult) {
    if (userResult.rows.length) {
      userId = userResult.rows[0][0];
    }
  } else {
    throw new ExpressError("User Not Found...", 404);
  }

  return userId;
};
