const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {res, req} = require("express");
const bodyParser = require("body-parser");
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const PORT = 8080;
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: 'user2RandomID'}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("pass", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Please enter a valid email/password');
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('Please enter a valid email/password');
  } else {
    let newUserId = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = newUserId;
    res.redirect("/urls");
  }
});

//login route and add cookies
app.post("/login", (req, res) => {
  const email = req.body.email;
  // const password = req.body.password;
  for (let userId in users) {
    if (!getUserByEmail(email, users)) {
      return res.status(403).send('The email you provided is incorrect');
    } else {
      const id = getUserByEmail(email, users);
      const passwordMatcher = bcrypt.compareSync(req.body.password, users[userId]["password"]);
      if (!passwordMatcher) {
        return res.status(403).send('The password you provided is incorrect');
      } else {
        req.session.user_id = id;
        return res.redirect('/urls');
      }
    }
  }
});

//creates new shortened URL in database associated with their userID
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body["longURL"],
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

//logout route and removes cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//allows user to delete their own urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const cookieID = req.session.user_id;
  const shortURL = req.params["shortURL"];
  if (cookieID === urlDatabase[shortURL]["userID"]) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  } else {
    return res.status(403).send('This is not your URL to change.');
  }
});

//edits longURL of user's own data
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlsID = urlDatabase[req.params.id]["userID"];
  if (urlsID === userID) {
    urlDatabase[req.params.id]["longURL"] = req.body.newLongURL;
    return res.redirect('/urls');
  } else {
    res.status(403).send('This is not your URL to change.');
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("registration", templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render('login', templateVars);
});

//main page for displaying users urls
app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    const userID = req.session.user_id;
    const userURLs = urlsForUser(userID, urlDatabase);
    const templateVars = {
      urls: userURLs,
      user: users[req.session.user_id]
    };
    res.render('urls_index', templateVars);
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render('please_login', templateVars);
  }
});

//page for creating new shortened urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/pleaselogin");
  }
});

app.get("/pleaselogin", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("please_login", templateVars);
});

//creates record of short url and long url for that user
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

//reroutes to longurl with shorturl link
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('*', (req, res) => {
  res.status(404).send('page not found');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



