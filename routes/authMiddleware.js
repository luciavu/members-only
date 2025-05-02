module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(401).render('unauthorised', {
      message: 'You are not authorized to view this resource. Please login.',
    });
  }
};

module.exports.isMember = (req, res, next) => {
  if (req.isAuthenticated() && req.user.member) {
    return next();
  } else {
    return res.status(403).render('unauthorised', {
      message: 'You are not authorized to view this resource because you are not a member.',
    });
  }
};

module.exports.checkAuthForChatroom = (req, res, next) => {
  const { chatroom } = req.params;

  if (!req.isAuthenticated()) {
    return res.status(401).render('unauthorised', {
      message: 'You are not authorized to view this resource. Please login.',
    });
  }

  if (chatroom === 'members' && !req.user.member) {
    return res.status(403).render('unauthorised', {
      message: 'You are not authorized to view this resource because you are not a member.',
    });
  }

  next();
};
