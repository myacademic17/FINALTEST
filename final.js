// Final Test
const path = require('path')
const dataServiceAuth = require('data-service-auth') 
const fs = require("fs");
const http = require("http");
const https = require("https"); 

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register", function(req, res){
    console.log("Resgistering User!");
        dataServiceAuth.registerUser(req.body).then(function(){
           res.render("register", {successMessage : userEmail + "registered successfully."});
           res.redirect("/home");
        }).catch(function(errors){
              res.render("register", {errorMessage : "Email or password cannot be empty."})
        });
}); 

app.get("/signIn",(req,res)=>{
    res.render("signIn");
});

app.post("/signIn", function(req,res){
    req.body.userEmail = req.get('Email');
    dataServiceAuth.checkUser(req.body).then(function(user){
      req.session.user = {
        email : user.email,
        password : user.password
      }
      res.render("register", {successMessage : userEmail + "signed in successfully."}); 
      res.redirect("/home");
    }).catch(function(err){
      res.render("signIn", {errorMessage : err, userEmail : req.body.userEmail});
    })
});


var mongoose = require("mongoose"); // require the moongose 
var Schema = mongoose.Schema; // schema variable 
 
//schema 
var finalUsers = new Schema({
    "email": String, unique, 
    "password": String
  });

  
//MongoDb connection function
    exports.startDB = function(){
    return new Promise(function(resolve, reject){
        let db = mongoose.createConnection("mongodb+srv://dbUser:dbUser123@senecaweb.qjtfeds.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser : true});
    
        db.on('error', (err) => {
        reject("MongoDB connection error."); 
    })

    db.once('open', () => {
        console.log('MongoDB connected.');
        User = db.model('users', finalUsers);
        resolve(); 
    })
})
}

//register user function
exports.registerUser = function(user){
    return new Promise(function (resolve, reject) {
        if(!user.password || !user.password2 || 
            !user.password.replace(/\s/g, '').length || 
            !user.password2.replace(/\s/g, '').length) {
            reject('Passwords cannot be empty or only white spaces!');
        }
        else if(user.password !== user.password2) {
            reject('Passwords do not match.');
        }
        else if(user.email.length == 0 || !user.email.replace(/\s/g, '').length) {
            reject('Email cannot be empty or only white spaces!');
        } 
        else{            
            bcrypt.genSalt(12, function(err, salt) { 
                bcrypt.hash(user.password, salt, (err, hashValue) => {
                    if(err) {
                        reject('There was an error encrypting the password');
                    }
                    else {
                        userData.password = hashValue
                        let newUser = new User(user)

                        newUser.save((err, user) => {
                            if(err) {
                                if(err.code === 11000) {
                                    reject('Error:' + user.email + 'already exists');
                                }
                                else {
                                    reject(err + "Cannot create the user.");
                                }
                            }
                            else {
                                resolve();
                            }
                        })
                    }
                })
            })
        }
    })
}

//signin function
exports.signIn = function(user){
    return new Promise(function (resolve, reject) {
        //first checking if enterd email and password are not blank
        if(user.email.length == 0 || !user.email.replace(/\s/g, '').length) {
            reject('Username cannot be empty or only white spaces!');
        }
        else if(!user.password || 
            !user.password.replace(/\s/g, '').length) {
            reject('Password cannot be empty or only white spaces!');
        }
        else{
            User.findOne({email: user.email})
            .exec()
            .then(foundUser => {
                if(foundUser) {
                    bcrypt.compare(user.password, foundUser.password).then((res) => {
                        if(res === true){
                            resolve(foundUser);
                        }
                        else{
                            reject('Password do not match for user: ' + user.email);
                        }
                    })
                }
                else {
                    reject('Unable to find user: ' + user.email);
                }
            })
            .catch(err => {
                reject('Unable to find user: ' + user.email);
            })
        }
    })
}

//all other routes
app.use((req,res)=>{
    res.status(404).send("Page Not Found");
});









