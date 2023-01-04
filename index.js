if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const oracledb = require("oracledb");

const ExpressError = require("./utils/ExpressError");

const app = express();

const userRoutes = require("./routes/user");
const searchRoutes = require("./routes/search");
const authRoutes = require("./routes/auth");
const otherRoutes = require("./routes/other");
const wrapAsync = require("./utils/wrapAsync");

const sessionConfig = {
  secret: "thishouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

oracledb.autoCommit = true;
if (process.platform === "win32") {
  // Windows
  oracledb.initOracleClient({
    libDir: "D:\\Code\\VS_Code\\instantclient_21_7",
  });
}

//-------------------------------------MIDDLEWARE--------------------------------------------------------------------------

app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session(sessionConfig));
app.use(flash());

//put this before the route handlers, so we have access to flash in each one
app.use((req, res, next) => {
  res.locals.currentUser = req.session.username;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", authRoutes);
app.use("/", otherRoutes);
app.use("/search", searchRoutes);
app.use("/users", userRoutes);

//----------------------------------------------HOME ROUTE--------------------------------------------------------------------

app.get(
  "/",
  wrapAsync(async (req, res) => {
    if (!req.session.username) {
      res.render("home");
    } else {
      res.redirect("/discover");
    }
  })
);

//------------------------------------------------OTHER-------------------------------------------------------------------------

//if nothing matches with the link entered, then we throw 404 not found error
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found..", 404));
});

// error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no! Something went wrong!";
  res.status(statusCode).render("error", { statusCode: statusCode, err: err });
});

//-------------------------------------------------------------------------------------------------------------------------------

app.listen(3000, (req, res) => {
  console.log("App is listening on port 3000");
});
