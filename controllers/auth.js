//login / register/ logout

const bcrypt = require("bcrypt");
const executeQuery = require("../utils/ExecuteQuery");
const makeFullName = require("../utils/helperFunctions/makeFullName");

module.exports.renderRegisterPage = (req, res) => {
  res.render("auth/register");
};

module.exports.registerUser = async (req, res) => {
  let query;

  const { username, password, firstName, lastName, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);
  const fullname = makeFullName(firstName, lastName);

  //check username existence
  query = `SELECT username FROM USERS WHERE username = '${username}'`;
  let userExistQuery = await executeQuery(query);
  if (userExistQuery.rows[0]) {
    req.flash("error", "Username already exists.. Please try again!");
    res.redirect("/register");
  } else {
    const nextvalQuery =
      "select users_user_id_seq.nextval, users_user_id_seq.currval from dual";
    const userVals = await executeQuery(nextvalQuery);
    const user_nextval = userVals.rows[0][0];
    const user_currval = userVals.rows[0][1];

    //check email from form
    if (email) {
      query = `INSERT INTO USERS VALUES (${user_nextval}, '${fullname}', '${username}', '${hashedPassword}', '${email}')`;
    } else {
      query = `INSERT INTO USERS VALUES (${user_nextval}, '${fullname}', '${username}', '${hashedPassword}', DEFAULT)`;
    }

    //register user
    const insertUser = await executeQuery(query);
    if (!insertUser) {
      req.flash(
        "error",
        "An error occured while trying to register you.. Try again!"
      );
      return res.redirect("/register");
    } else {
      //insert default images for the created user
      query = `INSERT INTO USERPROFILE_IMAGES VALUES (${user_currval}, DEFAULT)`;
      await executeQuery(query);
      query = `INSERT INTO USERBACKGROUND_IMAGES VALUES (${user_currval}, DEFAULT)`;
      await executeQuery(query);
    }

    //redirect to discover and store username into session
    req.session.username = username;
    req.flash("success", "Successfully registered!");
    res.redirect("/discover");
  }
};

module.exports.renderLoginPage = (req, res) => {
  res.render("auth/login");
};

module.exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT password FROM USERS WHERE username = '${username}'`;
  const userPasswordResult = await executeQuery(query);

  if (!userPasswordResult) {
    req.flash(
      "error",
      "An error occured while connecting to the DB.. Try again!"
    );
    return res.redirect("/login");
  }
  if (userPasswordResult.rows[0]) {
    if (bcrypt.compare(password, userPasswordResult.rows[0][0])) {
      //store username in session and redirect to discover
      req.session.username = username;
      req.flash("success", "Successfully logged in!");
      res.redirect("/discover");
    } else {
      req.flash("error", "Username or password is incorrect");
      res.redirect("/login");
    }
  } else {
    req.flash("error", "Username or password is incorrect");
    res.redirect("/login");
  }
};

module.exports.logoutUser = (req, res) => {
  //scoatem username=ul din session.username
  req.session.username = "";
  //redirect la login/register page
  req.flash("success", "Logged you out!");
  res.redirect("/");
};
