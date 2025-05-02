const pool = require('../config/database');

async function getUserByName(username) {
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0];
}

async function getUserById(id) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
}

async function addUser(username, hash, salt) {
  await pool.query(`INSERT INTO users(username, hash, salt) VALUES ($1, $2, $3);`, [
    username,
    hash,
    salt,
  ]);
}

async function getMessages(chatroom) {
  const { rows } = await pool.query(
    'SELECT club_messages.*, users.username from club_messages JOIN users ON club_messages.author_id = users.id WHERE chatroom = $1 ORDER BY club_messages.created_at DESC',
    [chatroom]
  );
  return rows;
}

async function updateMembership(user) {
  await pool.query('UPDATE users SET member = true WHERE id = $1', [user.id]);
  console.log('membership', user);
}

module.exports = {
  getUserByName,
  getUserById,
  addUser,
  getMessages,
  updateMembership,
};
