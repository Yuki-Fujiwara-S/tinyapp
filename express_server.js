const express = require("express");
const app = express();
const PORT = 8080;


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





app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


//Doesn't work yet - redirects to right link, Tiny URL doesnt work
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  console.log("urlDatabase", urlDatabase, "req.body.longURL:", req.body.longURL, typeof req.body.longURL);
  res.redirect(`/urls/:${randomString}`);         
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Doesn't work yet -> longURL may be incorrect
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//Doesn't work yet -> longURL may be incorrect/ clarify req.params with mentor
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});