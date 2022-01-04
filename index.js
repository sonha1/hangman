import express from "express";
import dotenv from "dotenv";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import passport from "passport";
import passportLocal from "passport-local";
import session from "express-session";
import User from "./models/User.js ";
import mongoose from "mongoose";
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_SERVER + "CookieAPP");

app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", "./views");
app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 4 * 60 * 1000,
        },
    })
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new passportLocal(User.authenticate()));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    User.register(
        new User({
            username: req.body.username,
            name: req.body.name,
        }),
        req.body.password,
        (err, user) => {
            if (err) {
                res.status(err.status).redirect("/register");
            }
            passport.authenticate("local")(req, res, function() {
                res.redirect("/login");
            });
        }
    );
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/hangman",
        failureRedirect: "/login",
    })
);

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
app.get("/hangman", isLoggedIn, async(req, res) => {
    const player = await User.findOne({
        username: res.locals.currentUser.username,
    });
    res.render("hangman", player);
});
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/login");
});

app.listen(port, () => {
    console.log(`http://localhost:${port}/login`);
});