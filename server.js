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
const { random } = require("lodash");

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
    email: String,
    username: String,
    password: String,
    googleId: String,

    bookings: {
        packages: [{ Name: String, destination: String, date: String, adults: String, mobile: String }],
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
var price = "";

app.get("/HampiDetails", function (req, res) {
    destination = "Hampi";
    price = "6,550";

    res.render('details', { destination: "Hampi", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 3 , price: price});
});

app.get("/AyodhyaDetails", function (req, res) {
    destination = "Ayodhya";
    price = "7,800";

    res.render('details', { destination: "Ayodhya", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 4 , price: price});
});

app.get("/VaranasiDetails", function (req, res) {
    destination = "Varanasi";
    price = "4,000";

    res.render('details', { destination: "Varanasi", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 4 , price: price});
});

app.get("/PuneDetails", function (req, res) {
    destination = "Pune";
    price = "8,750";

    res.render('details', { destination: "Pune", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 3 , price: price});
});

app.get("/MumbaiDetails", function (req, res) {
    destination = "Mumbai";
    price = "12,750";

    res.render('details', { destination: "Mumbai", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 4 , price: price});
});

app.get("/AurangabadDetails", function (req, res) {
    destination = "Aurangabad";
    price = "6,400";

    res.render('details', { destination: "Aurangabad", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 4 , price: price});
});

app.get("/KedarnathDetails", function (req, res) {
    destination = "Kedarnath";
    price = "9,900";

    res.render('details', { destination: "Kedarnath", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 3 , price: price});
});

app.get("/HaridwarDetails", function (req, res) {
    destination = "Haridwar";
    price = "6,450";

    res.render('details', { destination: "Haridwar", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 3 , price: price});
});

app.get("/RishikeshDetails", function (req, res) {
    destination = "Rishikesh";
    price = "7,400";

    res.render('details', { destination: "Rishikesh", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 4 , price: price});
});
app.get("/OotyDetails", function (req, res) {
    destination = "Ooty";
    price = "26,750";

    res.render('details', { destination: "Ooty", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 4 , price: price});
});
app.get("/KeralaDetails", function (req, res) {
    destination = "Kerala";
    price = "9,550";

    res.render('details', { destination: "Kerala", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 3 , price: price});
});
app.get("/GoaDetails", function (req, res) {
    destination = "Goa";
    price = "15,350";

    res.render('details', { destination: "Goa", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 4 , price: price});
});
app.get("/SundarbansDetails", function (req, res) {
    destination = "Sundarbans";
    price = "21,700";

    res.render('details', { destination: "Sundarbans", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 3 , price: price});
});
app.get("/AustraliaDetails", function (req, res) {
    destination = "Australia";
    price = "38,950";

    res.render('details', { destination: "Australia", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 5 , price: price});
});
app.get("/KarnatakDetails", function (req, res) {
    destination = "Karnataka";
    price = "25,500";

    res.render('details', { destination: "Karnataka", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 4, price: price});
});
app.get("/AfricaDetails", function (req, res) {
    destination = "Africa";
    price = "31,100";

    res.render('details', { destination: "Africa", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 4, price: price });
});
app.get("/MaldivesDetails", function (req, res) {
    destination = "Maldives";
    price = "34,000";

    res.render('details', { destination: "Maldives", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 5, price: price});
});
app.get("/BangkokDetails", function (req, res) {
    destination = "Bangkok";
    price = "30,200";

    res.render('details', { destination: "Bangkok", username: username, userLogged: userLogged, adminLogged: adminLogged, bookStatus: bookStatus, rating: 3, price: price});
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

var map2 = new Map();

var requiredOTP = Math.random() * 1000000;
requiredOTP = Math.floor(requiredOTP);

app.post("/sendOTP", function (req, res) {
    var enteredOTP = req.body.otp;

    if (enteredOTP == requiredOTP) {

        // cookies login code STEP-5
        // saving user in our database

        User.register({ username: username, email: email }, pass, function (err, user) {
            if (err) {
                console.log(err);
                res.send("A user with the given email/ username is already registered");
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/login");
                })
            }
        });

        userLogged = true; adminLogged = false; bookStatus = true;
        res.redirect("/login");
    }
});

app.post("/register", function (req, res) {

    email = req.body.email;
    username = req.body.username;
    pass = req.body.password;
    var duplicate = false;

    User.find(function (err, foundUsers) {
        if (err) {
            console.log(err);
        } else {
            if (foundUsers) {
                // console.log(foundUsers);

                for (var i = 0; i < foundUsers.length; i++) {
                    if (foundUsers[i].email == email || foundUsers[i].username == username) {
                        duplicate = true;
                        res.send("A user with the given email / username is already registered");
                    }
                }

            }
            if (!duplicate) {

                // send OTP via email using nodemailer
                var nodemailer = require('nodemailer');

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: "sirsatbuddhabhushan95@gmail.com",
                        pass: "ageuwuhsnokyodyy"      // this is a dummy password -> app password (mail)
                    }
                });

                var msg = "One Time Password for signUp is: " + requiredOTP;

                var mailOptions = {
                    from: "sirsatbuddhabhushan95@gmail.com",
                    to: email,
                    subject: 'OTP to access TravelHunts',
                    text: msg,
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                res.render('otp', { email: email, username: null, userLogged: false, adminLogged: false, bookStatus: false });

            }
        }
    })


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

app.post("/getDetails", function (req, res) {

    Name = req.body.name;
    adults = req.body.adults;
    date = req.body.date;
    mobile = req.body.number;
    var string = date;

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

    User.findById(req.user.id, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                
                foundUser.bookings.packages.push({ Name, destination, date, adults, mobile });

                foundUser.save(function () {
                    adminLogged = false;
                    userLogged = true;
                });
            }
        }
    });
});


app.get("/myBookings", function (req, res) {

    console.log(req.user.id);

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
    // res.redirect('../home');
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
        amount: "24500" * 100,
        currency: "INR",
    };

    razorpay.orders.create(options, function (err, order) {
        // console.log(order);
        res.json(order);
    });
});

app.post("/success", function (req, res) {
    alert("Package Booked Successfully !!!");

    res.render('invoice',{ adminLogged: adminLogged, userLogged: userLogged, username: username, bookStatus: bookStatus, Name:Name, destination:destination, adults:adults, date:date, mobile:mobile});
})

// Razorpay Payment Gateway Integration - Ends

app.post("/backToMyBookings", function(req, res){
    res.redirect("/myBookings");
});

app.listen(3000, function () {
    console.log("server has been started on port 3000");
});



// Twilio OTP sender - working properly, but we cant send otp to unverified mobile numbers

// app.post("/sendOTP", function (req, res) {
//     var code = "+91";
//     var num = req.body.mobileNumber;
//     num = code + num;

//     console.log(num);

//     const accountSid = "AC4296cd0657aa204b9b0dda4993cb79c5";
//     const authToken = "db97c408118b0f8959bd29a6cd7df3c6";

//     const client = require("twilio")(accountSid, authToken);

//     client.messages
//         .create({ body: "OTP verification Implemented Successfully - by bhushan", from: "+16204148049",
//         to: "+918857000693"})
//         .then(message => console.log(message.sid));

//     res.send("OTP Sent");
// });