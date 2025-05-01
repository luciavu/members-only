const passport = require('passport');
const pool = require('../config/database');
const { genPassword } = require('../lib/passwordUtils');
const { body, validationResult } = require('express-validator');

const lengthErr = 'must be between 3 and 15 characters.';

const validateUser = [
  body('username').trim().isLength({ min: 3, max: 15 }).withMessage(`Username ${lengthErr}`),
  body('password').trim().isLength({ min: 3, max: 15 }).withMessage(`Password ${lengthErr}`),
  body('confirmpassword')
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage(`Passwords don't match`),
];

module.exports = {
  getLogin: (req, res, next) => {
    res.render('login');
  },
  getSignup: (req, res, next) => {
    res.render('signup');
  },

  getHome: (req, res, next) => {
    res.render('index');
  },
  getLogout: (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  },

  postSignUp: [
    ...validateUser,
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        const { username, password } = req.body;

        // Check if username already exists
        const existingUser = await pool.query(`SELECT * FROM users WHERE username = $1`, [
          username,
        ]);
        if (existingUser.rows.length > 0) {
          return res.status(400).render('signup', {
            errors: [{ msg: 'Username already taken.' }],
          });
        }

        // Check password and username between 3 - 15 chars, passwords match
        if (!errors.isEmpty()) {
          return res.status(400).render('signup', { errors: errors.array() });
        }

        const { hash, salt } = genPassword(password);
        // Insert new user into database
        await pool.query(
          `INSERT INTO users(username, hash, salt, admin) VALUES ($1, $2, $3, $4);`,
          [req.body.username, hash, salt, false]
        );

        res.redirect('/login');
      } catch (err) {
        console.error(err);
        next(err);
      }
    },
  ],

  postLogin: passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/',
  }),
};
