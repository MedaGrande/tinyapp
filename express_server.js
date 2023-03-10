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

//users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//check if user is already registered
const getUserByEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
}

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

//renders shortURL & longURL to browser; add username after login/username replace with user_id
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
})

//create new url page
app.get("/urls/new", (req, res) => {
  res.render("urls_new", { user: users[req.cookies.user_id] });
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
})

//login
app.post("/login", (req, res) => {
  res.cookie('username', req.body.user_id);
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.user_id);
  res.redirect("/urls");
});

//register
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render("urls_register", templateVars);
});

//append new user to users database and set user_id cookie
app.post("/register", (req, res) => {
  if (!(req.body.email) || !(req.body.password)) {
    res.status(400);
    res.send('BadRequest: 400');
  }

  const status = getUserByEmail(req.body.email);
  if (status) {
  res.status(400);
  res.send('BadRequest: 400 / Already Registered');
  } else {
  const newUser = {};
  newUser['id'] = generateRandomString();
  newUser['email'] = req.body.email;
  newUser['password'] = req.body.password;
  users[newUser.id] = newUser; 
  res.cookie('user_id', newUser['id']);
  res.redirect("/urls");
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//generate random id
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});