const { Router } = require('express');
const indexRouter = Router();
const controller = require('../controllers/authController');

// Post routes
indexRouter.post('/login', controller.postLogin);
indexRouter.post('/signup', controller.postSignUp);

// Get routes
indexRouter.get('/', controller.getHome);
indexRouter.get('/login', controller.getLogin);
indexRouter.get('/signup', controller.getSignup);
indexRouter.get('/logout', controller.getLogout);

module.exports = indexRouter;
