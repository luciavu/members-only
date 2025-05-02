const { Router } = require('express');
const indexRouter = Router();
const controller = require('../controllers/authController');
const { isAuth, isMember, checkAuthForChatroom } = require('./authMiddleware');

// Post routes
indexRouter.post('/login', controller.postLogin);
indexRouter.post('/signup', controller.postSignUp);
indexRouter.post('/member-login', controller.postMemberLogin);
indexRouter.post('/:chatroom/new-message', isAuth, controller.postMessage);

// Get routes
indexRouter.get('/', controller.getHome);
indexRouter.get('/public', controller.getHome);
indexRouter.get('/login', controller.getLogin);
indexRouter.get('/signup', controller.getSignup);
indexRouter.get('/:chatroom/new-message', checkAuthForChatroom, controller.getNewMessage);
indexRouter.get('/member-login', controller.getMemberLogin);
indexRouter.get('/members', isMember, controller.getMembersHome);
indexRouter.get('/logout', controller.getLogout);

module.exports = indexRouter;
