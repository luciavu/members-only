const bcrypt = require('bcryptjs');

function genPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return {
    hash,
    salt,
  };
}

function validatePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

module.exports = { genPassword, validatePassword };
