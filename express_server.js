const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//parse the body received from form into object
app.use(express.urlencoded({ extended: true }));

//a get method demo
app.get("/", (req, res) => {
  res.send("Hello!");
});

//sends JSON format of urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//renders shortURL & longURL to browser; add username after login
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_index", templateVars);
})

//create new url page
app.get("/urls/new", (req, res) => {
  res.render("urls_new", { username: req.cookies.username });
});

//create new url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body;
  console.log(shortURL);
  urlDatabase[shortURL] = longURL.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//redirect after submitting new url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//delete
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//edit
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

//homepage after edit
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],username: req.cookies.username };
  res.render("urls_show", templateVars);
})

//login
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.urername);
  res.redirect("/urls");
});

//register
app.get("/register", (req, res) => {
  const username = req.cookies.username
  const templateVars = { username }
  res.render("urls_register", templateVars);
});
//after registration
app.post("/register", (req, res) => {
  res.render("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});