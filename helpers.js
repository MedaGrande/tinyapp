const { urlDatabase } = require("./database");

const getUserByEmail = function (email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return null;
};

//filter urls that belong to a particular id
const urlsForUser = (id) => {
  const urls = {};
  for (const shortID in urlDatabase) {
    const url = urlDatabase[shortID];
    if (url.userID === id) {
      urls[shortID] = url;
    }
  }
  return urls;
};

//generate random id
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString
};