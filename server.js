const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const db = require("quick.db");
const key = require("./database/authKey.js");
const User = require("./database/User").User;
const UserSchema = require("./database/User").forpass;
const fs = require("fs");
const axios = require("axios")
const Mails = require("./database/UserMails.js");
const Posts = require("./database/Posts.js");
const fetch = require("node-fetch");
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const mongoose = require("mongoose");
const socketio = require("socket.io");
const PORT = process.env.PORT || 3000;

const app = express();
const server = app.listen(PORT, function() {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
const io = socketio(server);

let clients = 0;

let usersSockets = [];

io.on("connection", function(socket) {
  clients++;
  socket.emit("connected");

  socket.on("user-connection", data => {
    usersSockets.push({
      name: data,
      id: socket.id
    });

    io.emit("userConnection", {
      message:
        "Yeni birisi söhbətə daxil oldu! Adı : " + data.split("@").shift(),
      username: data
    });
  });

  socket.on("add-friend", async usered => {
    let id = usered.searchedUser;
    let user = await User.findById({ id });
    let we = await User.findById(usered.reqUser.id);
    if (we.friends.includes(user.username)) {
      return;
    } else {
      User.updateOne(
        { username: we.username },
        { $push: { friends: user.id } },
        function(err, doc) {
          if (err) throw err;
          console.log(doc);
        }
      );
    }
  });

  socket.on("vip-user", name => {
    io.emit("vip-user", name);
  });

  socket.on("badWord", name => {
    socket.broadcast.emit("badword", name);   
  });

  socket.on("qutu-ac", name => {
    socket.broadcast.emit("silah", name);
  });

  socket.on("avatar", async filedata => {
    await User.update({ _id: filedata.url }, { avatar: filedata.fileUrl });
  });

  socket.on("message", obj => {
    let name = obj.name;
    let message = obj.message;

    socket.broadcast.emit("message", { name: name, message: message });
  });

  socket.on("duyuru", data => {
    io.emit("duyuru", data);
  });
  
  socket.on("new nick", data => {
    socket.broadcast.emit("message", data);
  });

  socket.on("log1", data => {
    io.emit("nicknameUpdate", data);
  });

  socket.once("disconnect", () => {
    clients--;
    socket.emit("disconnected");

    socket.on("user-disconnection", name => {
      socket.broadcast.emit(
        "userDisconnection",
        `${name} İstifadəçisi söhbət otağından ayrıldı.`
      );
    });
  });
});

let sessionMiddleware = session({
  secret: "neon project",
  resave: true,
  saveUninitialized: true
});

app.use(sessionMiddleware);

app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

const requestIp = require("request-ip");
app.use(requestIp.mw());

passport.use(
  new LocalStrategy(
    {
      email: "email",
      password: "password",
      passReqToCallback: true
    },
    function(req, email, password, done) {
      User.findOne({ email: email }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      });
    }
  )
);

function authorized(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

passport.serializeUser(function(user, done) {
  return done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  var userId = mongoose.Types.ObjectId(id);
  User.findById(id, function(err, user) {
    return done(err, user);
  });
});

mongoose
  .connect(key.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected To The Database..");
  });

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);

const clientID = "06e836190218f5cb7e27"
const clientSecret = "f74c360e1e6d63500df7ef37d6afd58c493d9928"

app.get("/login/github/callback", (req, res) =>{
   const url = `https://github.com/login/oauth/authorize?client_id=${clientID}`;
  axios({
    method : "GET",
    url : url
  })
})


app.post("/search", async (req, res) => {
  if (!req.body.data) {
    res.render("profile-search", {
      user: req.user
    });
  } else {
    let userId = await User.find({ username: req.body.data });

    console.log(userId);

    res.redirect("/search/profile/" + userId[0].username);
  }
});

app.post("/post", async (req, res) => {
  let { title, description, short_desc } = req.body;

  let Post = new Posts({
    title: title,
    description: description,
    date: Date.now(),
    short_description: short_desc,
    author: req.user.username,
    avatar: req.user.avatar,
    user_id: req.user.id
  });

  Post.save(async (err, data) => {
    if (err) throw err;
    console.log(data);
  });

  res.redirect("/posts");
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/profile/" + req.user.id);
  }
);


app.post("/register", async (req, res) => {
  let { username, email, password } = req.body;
  if (!username || !email || !password) {
    return;
  }

    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.redirect("back")
    } else {
        user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        await user.save();
        res.redirect("/login")
    }
});


app.get("/", async (request, response) => {
  response.render("index", { user: request.user });
  let giris = await db.fetch(`giris`);

  if (giris === null) await db.set(`giris`, 0);

  let sayi = await db.add(`giris`, 1);

  console.log(`${sayi} Kişi Ana Sayfaya Girdi.`);
});


app.get("/report", (req, res) => {
  res.render("idea");
});

app.get("/ders_5", async (req, res) => res.render("lessons/ders5"));

app.get("/ders_3", async (req, res) => res.render("lessons/ders3"));

app.get("/logout", async (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/profile/:id/mails", async (req, res) => {
  req.params.id = req.user.id;
  let user = await User.findById(req.user.id);

  res.render("mails", {
    userMails: user.mails
  });
});

app.get("/etrafli", async (req, res) => res.render("etrafli"));

app.get("/ders_4", async (req, res) => res.render("lessons/ders4"));

app.get("/ders_1", async (req, res) => res.render("lessons/ders1"));

app.get("/profile/:user_id/friends", authorized, async (req, res) => {
  req.params.user_id = req.user.id;
  let user = await User.findOne({ username: req.user.username });
  let friends = await User.find({ username: user.friends });

  res.render("friends", {
    friends: friends
  });
});

app.get("/profile/:id", authorized, async (req, res) => {
  req.params.id = req.user.id;
  let ui = await User.findById(req.params.id);

  console.log(ui.friends);

  res.render("girisedildi", {
    user: req.user
  });
});

app.get("/posts/:post_id", authorized, async (req, res) => {
  let post = await Posts.findById(req.params.post_id);

  res.render("viewpost", { data: post, author: post.author });
});

app.get("/ders_2", async (req, res) => res.render("lessons/ders2"));

app.get("/code", async (request, response) => response.render("kodlar"));

app.get("/profile-search", authorized, async (req, res) =>
  res.render("profile-search", { user: req.user })
);

app.get("/search/profile/:profile_name", authorized, async (req, res) => {
  let mem = req.params.profile_name;

  let searchedUser = await User.findOne({ username: mem });
  let isFriend = await User.findOne({ username: req.user.username });

  res.render("searched-profile", {
    user: searchedUser,
    reqUser: req.user.id,
    isFriend: isFriend.friends
  });
});

app.get("/create-post", authorized, async (req, res) =>
  res.render("create-post")
);

app.get("/status", async (request, response) => response.render("status"));

app.get("/chat", authorized, async (req, res) =>
  res.render("chat", {
    user: req.user,
    clients: clients
  })
);

app.get("/game", async (req, res) => res.render("tkm"));

app.get("/updates", async (request, response) => response.render("updates"));

app.get("/posts", authorized, async (req, res) => {
  let document = await Posts.find().sort("-title");
  console.log(document);
  res.render("posts", { data: document });
});

app.get("/team", async (req, res) => res.render("team"));

app.get("/register", (req, res) => res.render("register"));

app.get("/login", (req, res) => res.render("login"));

app.get("/albums/demon", (req, res) => res.render("sound-ui"))