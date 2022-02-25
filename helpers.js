const generateRandomString = function() {
  const stringLength = 6;
  const lowerCaseAlph = "abcdefghijklmnopqrtsuvwxyz";
  const upperCaseAlph = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const alphaNumericals = `${lowerCaseAlph}${upperCaseAlph}${numbers}`;
  let output = "";

  for (let i = 0; i < stringLength; i++) {
    output += alphaNumericals[(Math.floor(Math.random() * alphaNumericals.length))];
  }
  return output;
};

const urlsForUser = function(id, urlDB) {
  let specificUrlDB = {};
  for (let sixDigURL in urlDB) {
    if (id === urlDB[sixDigURL].userID) {
      specificUrlDB[sixDigURL] = urlDB[sixDigURL];
    }
  }
  return specificUrlDB;
}; 

const checkLogin = function(userDB, userInfo) {
  const { email } = userInfo;
  if (!emailLookup(userDB, email)) {
    return { error: "Error. Status 403. Email doesn't exist" };
  }
  return { error: null };
};

const getUserByEmail = function(email, database) {
  let userID = null;
  for (let user in database) {
    if (email === database[user].email) {
      userID = database[user]["id"];
    } 
  }
  return userID;
};

const checkValidRegistration = function(userDB, userInfo) {
  const { email, password } = userInfo;
  if (!email || !password) {
    return { error: "Error. Status 400"};
  }

  if (emailLookup(userDB, email)) {
    return { error: "Error. Status 400" };
  }
  return { error: null };
};

const emailLookup = function(userDB, email) {
  let outputBool = false;
  for (let user in userDB) {
    if (email === userDB[user].email) {
      outputBool = true;
    } 
  }
  return outputBool;
};

module.exports = { generateRandomString, urlsForUser, checkLogin, getUserByEmail, checkValidRegistration}