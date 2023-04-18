//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var alert = require('alert');
const Razorpay = require("razorpay");

mongoose.set('strictQuery', false);

//google login STEP-1
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");


// cookies session setups  STEP-1
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { test } = require("media-typer");
const { boolean } = require("webidl-conversions");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


// login status
var adminLogged = false;
var userLogged = false;
var bookStatus = false;
var username = null;
// var paymentDone = false;

var loggedUser2 = null;   // for google sign in


//cookie session setup STEP-2
app.use(session({
    secret: "my little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// mongoose.connect("mongodb://127.0.0.1:27017/mcdb");


mongoose.connect("mongodb+srv://sirsatbuddhabhushan95:123@cluster0.ze0jsoo.mongodb.net/tourismDB", { useNewUrlParser: true });


const userSchema = mongoose.Schema({
    username: String,
    password: String,
    googleId: String,

    bookings: {//destination: String,
        //   destination: [],
        packages: [{ Name: String, destination: String, date: String, adults: String, bookID: Number }],
        //   Name: String,
        //   date: Date,
        //   adults: String
    }
});


//cookie setup STEP-3
userSchema.plugin(passportLocalMongoose);

//google login / findorcreate setup
userSchema.plugin(findOrCreate);

const User = mongoose.model("user", userSchema);



//cookie setup STEP-4
passport.use(User.createStrategy());

//google login STEP-4
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

//google login STEP-2
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, cb) {
        loggedUser2 = profile.id;
        isLogged = true;
        // username = profile.displayName;
        username = profile.name.givenName;
        console.log(profile);
        User.findOrCreate({ googleId: profile.id, username: username }, function (err, user) {
            return cb(err, user);
        });
    }
));

app.get("/", function (req, res) {
    res.redirect("/home");
});

//google login STEP-3
app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function (req, res) {
        // Successful authentication, redirect secrets
        console.log(username);
        userLogged = true;
        bookStatus = true;
        res.redirect("/home");
    });


app.get("/home", function (req, res) {
    res.render('home', { username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/about", function (req, res) {
    res.render('about', { username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/contact", function (req, res) {
    res.render('contact', { username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/login", function (req, res) {
    res.render('login', { adminLogged: adminLogged, userLogged: userLogged, username: username, bookStatus: bookStatus });
});

app.get("/register", function (req, res) {
    res.render('register', { adminLogged: adminLogged, userLogged: userLogged, username: username, bookStatus: bookStatus });
});

app.get("/packages", function (req, res) {
    res.redirect("/home#packageID");
});


console.log(username);

// For handeling packages
var category = "tempCategory";
var place1 = "p1";
var place2 = "p2";
var place3 = "p3";
var imgName = "Tempimg";

app.get("/historicalPackages", function (req, res) {
    category = "Historical";
    place1 = "Hampi"; place2 = "Ayodhya"; place3 = "Varanasi";
    imgName = "hist";
    res.render('subPackages', { category: category, place1: place1, place2: place2, place3: place3, imgName: imgName, username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/districtPackages", function (req, res) {
    category = "District";
    place1 = "Pune"; place2 = "Mumbai"; place3 = "Aurangabad";
    imgName = "dist";
    res.render('subPackages', { category: category, place1: place1, place2: place2, place3: place3, imgName: imgName, username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/devotionalPackages", function (req, res) {
    category = "Devotional";
    place1 = "Kedarnath"; place2 = "Haridwar"; place3 = "Rishikesh";
    imgName = "devotional";
    res.render('subPackages', { category: category, place1: place1, place2: place2, place3: place3, imgName: imgName, username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/wildlifePackages", function (req, res) {
    category = "Wildlife";
    place1 = "Sundarbans"; place2 = "Australia"; place3 = "Karnatak";
    imgName = "tiger";
    res.render('subPackages', { category: category, place1: place1, place2: place2, place3: place3, imgName: imgName, username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/naturePackages", function (req, res) {
    category = "Nature";
    place1 = "Ooty"; place2 = "Kerala"; place3 = "Goa";
    imgName = "nature";
    res.render('subPackages', { category: category, place1: place1, place2: place2, place3: place3, imgName: imgName, username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/premiumPackages", function (req, res) {
    category = "Premium";
    place1 = "Africa"; place2 = "Maldives"; place3 = "Bangkok";
    imgName = "premium";
    res.render('subPackages', { category: category, place1: place1, place2: place2, place3: place3, imgName: imgName, username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

// details section
var destination = "";

app.get("/HampiDetails", function (req, res) {
    destination = "Hampi";
    res.render('details', { destination: "Hampi", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/AyodhyaDetails", function (req, res) {
    destination = "Ayodhya";
    res.render('details', { destination: "Ayodhya", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/VaranasiDetails", function (req, res) {
    destination = "Varanasi";
    res.render('details', { destination: "Varanasi", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/PuneDetails", function (req, res) {
    destination = "Pune";
    res.render('details', { destination: "Pune", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/MumbaiDetails", function (req, res) {
    destination = "Mumbai";
    res.render('details', { destination: "Mumbai", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/AurangabadDetails", function (req, res) {
    destination = "Aurangabad";
    res.render('details', { destination: "Aurangabad", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/KedarnathDetails", function (req, res) {
    destination = "Kedarnath";
    res.render('details', { destination: "Kedarnath", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/HaridwarDetails", function (req, res) {
    destination = "Haridwar";
    res.render('details', { destination: "Haridwar", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});

app.get("/RishikeshDetails", function (req, res) {
    destination = "Rishikesh";
    res.render('details', { destination: "Rishikesh", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});
app.get("/OotyDetails", function (req, res) {
    destination = "Ooty";
    res.render('details', { destination: "Ooty", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});
app.get("/KeralaDetails", function (req, res) {
    destination = "Kerala";
    res.render('details', { destination: "Kerala", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});
app.get("/GoaDetails", function (req, res) {
    destination = "Goa";
    res.render('details', { destination: "Goa", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});
app.get("/SundarbansDetails", function (req, res) {
    destination = "Sundarbans";
    res.render('details', { destination: "Sundarbans", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});
app.get("/AustraliaDetails", function (req, res) {
    destination = "Australia";
    res.render('details', { destination: "Australia", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});
app.get("/KarnatakDetails", function (req, res) {
    destination = "Karnatak";
    res.render('details', { destination: "Karnatak", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});
app.get("/AfricaDetails", function (req, res) {
    destination = "Africa";
    res.render('details', { destination: "Africa", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});
app.get("/MaldivesDetails", function (req, res) {
    destination = "Maldives";
    res.render('details', { destination: "Maldives", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});
app.get("/BangkokDetails", function (req, res) {
    destination = "Bangkok";
    res.render('details', { destination: "Bangkok", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus });
});


//////////////////////////////////////////////////////////////



app.get("/admin", function (req, res) {
    adminLogged = true;
    userLogged = false;
    res.redirect('login');
});

app.get("/loginUser", function (req, res) {
    adminLogged = false;
    userLogged = true;
    res.redirect('login');
});


// get book request
app.post("/book", function (req, res) {

    // console.log(destination);

    if (userLogged == false && adminLogged == false) {
        res.redirect('login');
    }
    else {

        res.render('getDetails', { destination: destination, adminLogged: adminLogged, userLogged: userLogged, username: username, bookStatus: bookStatus });
    }
});


app.get("/logout", function (req, res, next) {
    username = null;
    userLogged = false;
    adminLogged = false;
    bookStatus = false;

    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

app.post("/register", function (req, res) {

    //cookies login code STEP-5
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.send(" A user with the given username is already registered");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/login");
            })
        }
    });
});

app.post("/login", function (req, res) {

    loggedUser = req.body.username; // logged user id

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    if (req.body.username == "admin" && req.body.password == "admin" && adminLogged == true) {
        adminLogged = true;
        userLogged = false;
        username = "admin";
        res.redirect("/allBookings");
        return;
    }

    if (req.body.username == "admin" && req.body.password == "admin" && adminLogged == false) {
        res.send("Please login as Admin");
        return;
    }

    if (req.body.username != "admin" && req.body.password != "admin" && adminLogged == true) {
        res.send("Please login as user");
        return;
    }


    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {

                userLogged = true;
                username = req.body.username;
                bookStatus = true;
                userID = req.body.id;
                res.redirect("/home");

            })

        }
    });

});


// when user booked any destination after filling the form
var bookID = 0;

app.post("/getDetails", function (req, res) {

    Name = req.body.name;
    adults = req.body.adults;
    date = req.body.date;
    var string = date;

    // console.log("Save hogaya");

    // make the string in format DD-MM-YY

    var i = 0;
    var cnt = 1;
    var ans = "";

    while (i < string.length) {
        var temp = "";
        while (string[i] != '-' && i < string.length) {
            temp += string[i];
            i++;
        }
        if (cnt == 1) year = temp;
        else if (cnt == 2) month = temp;
        else if (cnt == 3) day = temp;
        cnt++;
        i++;
    }

    ans += day; ans += "-";
    ans += month; ans += "-";
    ans += year;

    date = ans;
    console.log(date);


    User.findById(req.user.id, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bookID += 1;
                foundUser.bookings.packages.push({ Name, destination, date, adults, bookID });

                foundUser.save(function () {  
                    adminLogged = false;
                    userLogged = true;
                });
            }
        }
    });
});


app.get("/myBookings", function (req, res) {
    // console.log(userID);
    // console.log(req.user.id);

    User.findById(req.user.id, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                var myPackages = foundUser.bookings.packages;

                res.render('myBookings', { adminLogged: adminLogged, userLogged: userLogged, username: username, packages: myPackages, bookStatus: bookStatus });
            }
            else {
                res.redirect("/login");
            }
        }
    });
});


app.post("/delete", function (req, res) {
    var index = req.body.deleteBtn;
    console.log(index);

    console.log("before userID");

    console.log(userID);

    var targetID = "";
    if (adminLogged) targetID = userID;
    else targetID = req.user.id;

    // delete object at index = index... (in package array)

    User.findById(targetID, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                var myPackages = foundUser.bookings.packages;

                // console.log(myPackages[index]);

                // delete myPackages[index];
                var newPackage = [];

                for (var i = 0; i < myPackages.length; i++) {
                    if (i == index) continue;
                    newPackage[i] = myPackages[i];
                }

                foundUser.bookings.packages = newPackage;

                foundUser.save(function () {
                    alert("Package deleted successfully !!!");
                    if (adminLogged) res.redirect("/allBookings");
                    else res.redirect("/myBookings");
                });
            }
        }
    });

    // console.log(index);
});

var allUsers = [];


app.get("/allBookings", function (req, res) {
    // find all users
    adminLogged = true;

    User.find(function (err, foundUsers) {
        if (err) {
            console.log(err);
        } else {
            if (foundUsers) {
                allUsers = foundUsers;

                res.render('allBookings', { adminLogged: adminLogged, userLogged: userLogged, username: username, bookStatus: bookStatus, foundUsers: foundUsers });
            }
        }
    });
});

var userID = "";

app.post("/showBookings", function (req, res) {
    adminLogged = true;
    userLogged = false;

    userID = req.body.showBtn;
    console.log(userID);

    User.findById(userID, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                var myPackages = foundUser.bookings.packages;

                res.render('myBookings', { adminLogged: adminLogged, userLogged: userLogged, username: username, packages: myPackages, bookStatus: bookStatus, foundUser: foundUser });
            }
            else {
                res.redirect("/login");
            }
        }
    });
})



// Razorpay Payment Gateway Integration - Start

var razorpay = new Razorpay({
    key_id: 'rzp_test_j2WOdHSdTjraeX',
    key_secret: 'WwomuKJJiCgRYlkmyicsArLp',
});

app.post("/order", function (req, res) {
    var options = {
        amount: 25000 * 100,
        currency: "INR",
    };

    razorpay.orders.create(options, function (err, order) {
        // console.log(order);
        res.json(order);
    });
});

app.post("/success", function (req, res) {
    // paymentDone = true;
    alert("Package Booked Successfully !!!");
    res.redirect("/myBookings");
})

// Razorpay Payment Gateway Integration - Ends

app.listen(3000, function () {
    console.log("server has been started on port 3000");
});