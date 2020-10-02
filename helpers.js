//checks if users email is already registered
const getUserByEmail = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
};

//creates random id number
const generateRandomString = function() {
  return Math.random().toString(20).substr(2, 6);
};

// function looks up individuals id and their specific urls
const urlsForUser = (id, database) => {
  const userDatabase = {};
  for (let key in database) {
    if (database[key].userID === id) {
      userDatabase[key] = {
        longURL: database[key].longURL,
        userID: id };
    }
  }
  return userDatabase;
};


module.exports = { getUserByEmail, generateRandomString, urlsForUser };


