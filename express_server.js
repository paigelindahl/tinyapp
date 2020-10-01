const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const PORT = 8080; 
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
const {response, request} = require("express");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: 'user2RandomID'}
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "pass"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// function looks up individuals id and their specific urls
const urlsForUser = (id) => {
  const userDatabase = {};
  for (let key in urlDatabase){
    if (urlDatabase[key].userID === id){
      userDatabase[key] = {
        longURL: urlDatabase[key].longURL,
        userID: id }
    } 
  }
  return userDatabase;
};

//creates random id number
function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
};

//checks if users email is already registered
const isEmailThere = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
};

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Please enter an email/password');
  } else if (isEmailThere(req.body.email)) {
    res.status(400).send('Please enter an email/password');
  } else {
    let newUserId = generateRandomString();

    users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', newUserId);
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  for (let userId in users) {
    if (!isEmailThere(email)) {
      return res.status(403).send('The email you provided is incorrect');
    } else {
      const id = isEmailThere(email);
      if (users[id].password !== password) {
        return res.status(403).send('The password you provided is incorrect');
      } else {
        console.log('this is id', id);
        res.cookie('user_id', id);
        return res.redirect('/urls');
      }
    }
  }
});


app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body["longURL"], 
    userID: req.cookies['user_id'],
  }
  res.redirect(`/urls/${shortURL}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlId = req.params.shortURL;
  delete urlDatabase[urlId];
  res.redirect("/urls");
});

//edits longURL if user's own data
app.post("/urls/:id", (req, res) => {
  // const userURLs = urlsForUser(req.cookies["user_id"]);
  const userID = req.cookies["user_id"];
  const urlsID = urlDatabase[req.params.id]["userID"]
  if (urlsID === userID) {
     urlDatabase[req.params.id]["longURL"]=req.body.newLongURL;
    return res.redirect('/urls');
  } else {
    res.status(403).send('This is not your URL to change.')
  }
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  if (req.cookies['user_id']) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("registration", templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('login', templateVars);
});

app.get('/urls', (req, res) => {

  if (req.cookies["user_id"]) {
    const userID = req.cookies["user_id"];
    const userURLs = urlsForUser(userID);
    const templateVars = {
      urls: userURLs,
      user: users[req.cookies["user_id"]]
    };
    res.render('urls_index', templateVars);
  } else {
    res.redirect("/register");
  }
});

//creates record of short url and long url for that user
app.get("/urls/:shortURL", (req, res) => {
  console.log(urlsForUser(req.cookies["user_id"]));
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL, 
    user : users[req.cookies["user_id"]]
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


