const express = require("express");
const app = express();
const PORT = 8080;
const { generateRandomString, urlsForUser, checkLogin, getUserByEmail, checkValidRegistration} = require("./helpers");

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['secret key1', 'secret key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcryptjs');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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

// GET /
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});

// GET /urls
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('<h1> User must log in to access URLs <a href="/login"> Log in here </a> </h1>');
  }
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: urls,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

// GET /urls/new
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  return res.render("urls_new", templateVars);
});

// GET /urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send('<h1> User must log in to access URLs <a href="/login"> Log in here </a> </h1>');
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

// GET /u/:id
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect(403, "/urls");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// POST /urls
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect(403, "/login");
  }
  const randomString = generateRandomString();
  urlDatabase[randomString] = {
    longURL:req.body.longURL,
    userID:req.session.user_id
  };
  return res.redirect(`/urls/${randomString}`);
});

// Update POST /urls/:shortURL/update --> Gave it this name instead of just /urls/:id because it made it easier for me to follow
app.post('/urls/:shortURL/update', (req, res) => {
  const shortURL = req.params.shortURL;
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  if (!urls[shortURL]) {
    return res.status(403).send('<h1> You do not have access to the URL </h1>');
  }
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id};
  res.redirect("/urls");
});

// Delete POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const urls = urlsForUser(req.session.user_id, urlDatabase);
  if (!urls[shortURL]) {
    return res.status(403).send('<h1> You do not have access to the URL </h1>');
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// GET /login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

// GET /register
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("registration", templateVars);
});

// POST /login
app.post('/login', (req, res) => {
  const { error } = checkLogin(users, req.body);

  if (error) {
    console.log(error);
    return res.redirect(403, "/urls");
  }

  const { email, password } = req.body;
  const userID = getUserByEmail(email, users);

  bcrypt.compare(password, users[userID].password)
    .then((result) => {
      if (result) {
        req.session.user_id = userID;
        res.redirect("/urls");
      } else {
        return res.status(401).send('Password incorrect');
      }
    });
});

// POST /register - adds a new user to global user object
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const { error } = checkValidRegistration(users, req.body);
  if (error) {
    console.log(error);
    return res.status(400).send(`<h1> ${error} <a href="/register"> Register here </a> </h1>`);
  }

  const {email, password} = req.body;
  bcrypt.genSalt(10)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      users[userID] = { id: userID, email, password: hash };
      req.session.user_id = userID;
      res.redirect("/urls");
    });
});

// Update POST /logout
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

// GET /urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});