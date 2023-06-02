const express = require('express');
const router = express.Router();
const app = express();
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');
const expressEjsLayout = require('express-ejs-layouts')
let ejs = require('ejs');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require("./config/passport")(passport)

//creating connection with mysql
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'FormatConverter'
});


//checking the connection if passed or not
connection.connect((err) => {
    if (err) {
      console.error('Error connecting to database: ' + err.stack);
      return;
    }
    console.log('Connected to database');
});


//setting ejs
app.set('view engine','ejs');
app.use(expressEjsLayout);

//public or static files 
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended : false}));

//express session
app.use(session({
  secret : 'secret',
  resave : true,
  saveUninitialized : true
 }));
 app.use(passport.initialize());
 app.use(passport.session());
 //use flash
 app.use(flash());
 app.use((req,res,next)=> {
   res.locals.success_msg = req.flash('success_msg');
   res.locals.error_msg = req.flash('error_msg');
   res.locals.error  = req.flash('error');
 next();
 })

//defining the path for index and users 
app.use('/',require('./routes/index'));
app.use('/users',require('./routes/users'));
app.use('/convert',require('./routes/convert'));



//running in localhost 3000
app.listen(3000,function(){
    console.log("server started");
}); 























// const express = require('express');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcryptjs');
// const session = require('express-session');
// const flash = require('connect-flash');
// const mysql = require('mysql2');
// const { v4: uuidv4 } = require('uuid');


// //creating connection with mysql
// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'password',
//   database: 'FormatConverter'
// });


// //checking the connection if passed or not
// connection.connect((err) => {
//     if (err) {
//       console.error('Error connecting to database: ' + err.stack);
//       return;
//     }
//     console.log('Connected to database');
// });

// //creating a route using express and including all requirements
// const app = express()
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(express.static(__dirname+'/public'));
// app.use(flash());

// //initializes the sessions
// app.use(session({
//   secret: 'secret',
//   resave: true,
//   saveUninitialized: true
// }));



// app.get('/',function(req,res){
//     res.sendFile(__dirname+'/register.html')
// });



// app.post('/', async (req, res) => {
//     const name = req.body.userName;
//     const email = req.body.email;
//     const password = req.body.password;
//     const rePassword = req.body.repassword;
  

//   // Checking if all the fields are filled or not
//   if (!name || !email || !password || !rePassword) {
//     req.flash('error', 'Please fill all the fields');
//     return res.redirect('/');
//   }

//   // Checking if the name is existing in the database or not
//   const [rows, fields] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE name = ?', [name]);
//   const count = rows[0].count;
//   if (count > 0) {
//     req.flash('error', 'Name is already exist,register with new name');
//     return res.redirect('/');
//   }

//   // Checking the email is valid or not
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     req.flash('error', 'Please enter a valid email address');
//     return res.redirect('/');
//   }

//   // Checking for the strong password
//   const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
//   if (!passwordRegex.test(password)) {
//     req.flash('error', 'Password must contain at least 8 characters, including at least 1 uppercase letter, 1 lowercase letter, and 1 number');
//     return res.redirect('/');
//   }

//   // Checking for password and re-password is matching or not 
//   if (password !== rePassword) {
//     // req.flash('error', 'Passwords do not match');
//     return res.redirect('/');
//   }

//   //encrypting the passowrd with bcrypt function
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(password, salt);

//   // 
//   const userId = uuidv4();
//   const user = {
//     id: userId,
//     name,
//     email,
//     password: hashedPassword
//   };

//   try {
//     const [result] = await user.execute('INSERT INTO users SET ?', [user]);
//     req.flash('success', 'You have successfully registered');
//     res.redirect('/login');
//   } catch (err) {
//     req.flash('error', 'An error occurred');
//     res.redirect('/');
//   }
// });

// app.listen(3000,function(){
//     console.log("server started");
//     });



