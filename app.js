require('dotenv').config();

const path = require('node:path');
const pool = require('./config/database');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const indexRouter = require('./routes/index');

// UsePostgreSQL connection to store sessions
const pgSession = require('connect-pg-simple')(session);

// Create the Express application
const app = express();

app.use(helmet());
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    store: new pgSession({
      pool: pool, // use exisiting pg pool
      createTableIfMissing: true,
    }),
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  })
);

// Passport Authentication
require('./config/passport');
app.use(passport.session());
app.use((req, res, next) => {
  console.log(req.session);
  console.log(req.user);
  res.locals.user = req.user;
  next();
});
// Routes
app.use(indexRouter);

// Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

//Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
