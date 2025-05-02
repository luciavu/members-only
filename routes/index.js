const { Router } = require('express');
const indexRouter = Router();
const controller = require('../controllers/authController');
const isMember = require('./authMiddleware').isMember;
// Post routes
indexRouter.post('/login', controller.postLogin);
indexRouter.post('/signup', controller.postSignUp);
indexRouter.post('/member-login', controller.postMemberLogin);

// Get routes
indexRouter.get('/', controller.getHome);
indexRouter.get('/login', controller.getLogin);
indexRouter.get('/signup', controller.getSignup);
indexRouter.get('/member-login', controller.getMemberLogin);
indexRouter.get('/member', isMember, controller.getMembersHome);
indexRouter.get('/logout', controller.getLogout);

module.exports = indexRouter;
