const passport = require('passport');
const db = require('../db/queries');
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

const titleErr = 'must be between 3 and 30 characters.';
const messageErr = 'must be between 3 and 100 characters.';
const validateMessage = [
  body('title').trim().isLength({ min: 3, max: 50 }).withMessage(`Title ${titleErr}`),
  body('message').trim().isLength({ min: 3, max: 200 }).withMessage(`Message ${messageErr}`),
];

async function getHome(req, res, next) {
  const messages = await db.getMessages('public');
  res.render('index', { chatroom: 'public', messages: messages });
}

const getMemberLogin = (req, res, next) => {
  res.render('member-login');
};

const getNewMessage = (req, res, next) => {
  const { chatroom } = req.params;
  res.render('new-message', { chatroom: chatroom });
};

async function getMembersHome(req, res, next) {
  const messages = await db.getMessages('members');
  res.render('index', { chatroom: 'members', messages: messages });
}

const getLogin = (req, res, next) => {
  res.render('login');
};

const getSignup = (req, res, next) => {
  res.render('signup');
};

const getLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

const postLogin = passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/',
});

const postSignUp = [
  ...validateUser,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const { username, password } = req.body;

      // Check if username already exists
      const existingUser = await db.getUserByName(username);
      if (existingUser) {
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
      await db.addUser(req.body.username, hash, salt);
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
];

const postMessage = [
  ...validateMessage,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      const { title, message } = req.body;
      const { chatroom } = req.params;

      // Check title and message atleast 3 chars
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .render('new-message', { chatroom: chatroom, errors: errors.array() });
      }
      // Insert new message and reload chatroom
      await db.addMessage(req.user.id, title, message, chatroom);
      res.redirect(`/${chatroom}`);
    } catch (err) {
      console.error(err);
      next(err);
    }
  },
];

const postMemberLogin = async (req, res, next) => {
  const { memberPass } = req.body;
  if (memberPass !== process.env.MEMBER_PASS) {
    return res.render('member-login', {
      errors: [{ msg: 'Incorrect password. Please try again.' }],
    });
  }
  try {
    if (!req.user) {
      return res.status(401).render('member-login', {
        errors: [{ msg: 'You must be logged in to become a member.' }],
      });
    }
    await db.updateMembership(req.user);
    res.redirect('/member');
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  getLogin,
  getSignup,
  getMemberLogin,
  getMembersHome,
  getNewMessage,
  getHome,
  getLogout,
  postMessage,
  postSignUp,
  postLogin,
  postMemberLogin,
};
