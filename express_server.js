const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers");


app.set("view engine", "ejs");
app.use(cookieParser());

//parse the body received from form into object
app.use(express.urlencoded({ extended: true }));

//cookie encryption
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//urlDatabase
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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

//a get method demo
app.get("/", (req, res) => {
  res.send("Hello!");
});

//send JSON format of urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//renders shortURL & longURL to browser; add username after login; replace username  with user_id in cookies
app.get("/urls", (req, res) => {
  const userURLS = urlsForUser(req.session.user_id);
  const templateVars = {
    urls: userURLS,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

//get the urls/new page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    res.render("urls_new", { user: users[req.session.user_id] });
  } else {
    res.redirect("/login");
  }
});

//create new url when logged in only
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  if (userID) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {
      longURL,
      userID
    };
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send('BadRequest: 403');
  }
});

//redirect to website using existing shortenedURL id
app.get("/u/:id", (req, res) => {
  const urlIDs = Object.keys(urlDatabase);
  for (const urlID of urlIDs) {
    if (urlID === req.params.id) {
      const longURL = urlDatabase[req.params.id].longURL;
      return res.redirect(longURL);
    }
  }
  res.status(403);
  res.send('BadRequest: 403');
});

//delete
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send('BadRequest: 400');
  }
});

//edit
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const shortID = req.params.id;
  if (userID) {
    urlDatabase[shortID].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send('BadRequest: 400');
  }
});

//urls/shortURL
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userURLS = urlsForUser(userID);
  const shortID = req.params.id;
  
  if (!userURLS[shortID] || !userID) {
    res.status(400);
    res.send('BadRequest: Either shortURL does not exist or it does not  belong to you or you need to login!');
  }

  if (userID === userURLS[shortID].userID) {
    const templateVars = {
      id: shortID,
      longURL: urlDatabase[shortID].longURL,
      user: users[userID]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(400);
    res.send('BadRequest: 400');
  }
});
      
//login page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

//login
app.post("/login", (req, res) => {
  const status = getUserByEmail(req.body.email, users);
  const password = req.body.password;

  if (!status || !(bcrypt.compareSync(password, users[status].password))) {
    res.status(403);
    res.send('BadRequest: 403');
  } else {
    req.session.user_id = users[status]['id'];
    res.redirect("/urls");
  }
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//register
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});


//append new user to users database and set user_id cookie
app.post("/register", (req, res) => {
  if (!(req.body.email) || !(req.body.password)) {
    res.status(400);
    res.send('BadRequest: 400');
  }

  const status = getUserByEmail(req.body.email, users);
  console.log(status);

  if (status) {
    res.status(400);
    res.send('BadRequest: 400 / Already Registered');
  } else {
    const newUser = {};
    newUser['id'] = generateRandomString();
    newUser['email'] = req.body.email;
    newUser['password'] = bcrypt.hashSync(req.body.password, 10);
    users[newUser.id] = newUser;
    req.session.user_id = newUser['id'];
    res.redirect("/urls");
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//generate random id
function generateRandomString() {
  return Math.random().toString(36).slice(2, 8);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});