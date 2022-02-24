const express = require("express");
const app = express();
const PORT = 8080;

const cookieParser = require('cookie-parser');
app.use(cookieParser())

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


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



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


//
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});


//Works! Redirects and shows TinyURLFor
app.post("/urls", (req, res) => {
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);         
});

//error thrown
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

//error thrown
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
   };
  res.render("urls_show", templateVars);
});

//Works! error was to do with not inputting http
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Read GET /register
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("registration", templateVars);
});

// Read GET /login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("login", templateVars);
});

// Delete POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

// Update POST /urls/:shortURL/delete
app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
})

// Update POST /login
app.post('/login', (req, res) => {
  const { error } = checkLogin(users, req.body);

  if (error) {
    console.log(error);
    return res.redirect(403, "/urls");
  }

  const { email } = req.body;
  const userID = getIDfromEmail(users, email);

  res.cookie("user_id", userID);
  res.redirect("/urls");
})

// Update POST /logout
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

// Update POST /register - adds a new user to global user object
app.post('/register', (req, res) => {
  const user_id = generateRandomString();
  const { error } = checkValidRegistration(users, req.body);
  if (error) {
    console.log(error);
    return res.redirect(400, "/urls");
  }

  const {email, password} = req.body;

  users[user_id] = { id: user_id, email, password };
  console.log(users);
  res.cookie("user_id", user_id);
  res.redirect("/urls");
})

const checkLogin = function(userDB, userInfo) {
  const { email, password } = userInfo;
  const userID = getIDfromEmail(users, email);
  console.log(userID);

  if (!emailLookup(userDB, email)) {
    return { error: "Error. Status 403" };
  }

  if (password !== userDB[userID].password) {
    return { error: "Error. Status 403" };
  }
  return { error: null };
};

const getIDfromEmail = function(userDB, email) {
  let userID = null;
  for (let user in userDB) {
    console.log(userDB[user].email);
    if (email === userDB[user].email) {
      userID = userDB[user]["id"];
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
  console.log(email);
  for (let user in userDB) {
    console.log(userDB[user].email);
    if (email === userDB[user].email) {
      outputBool = true;
    } 
  }
  return outputBool;
};

// Update POST /urls/:id
// app.post('/urls/:id', (req, res) => {
//   const id = req.params.id;
//   urlDatabase[id] = req.body.longURL;
//   res.redirect("/urls");
// })


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});