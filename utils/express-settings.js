function declareSettings(app, express, sessionMiddleware, passport){
    app.use(express.static("public"));
    app.use(express.urlencoded({ extended: false }));
    app.set("view engine", "ejs");
    app.set("port", process.env.PORT || 3000);
    app.use(sessionMiddleware);
    app.use(express.json());
    app.use(passport.initialize());
    app.use(passport.session());
}

module.exports = declareSettings;