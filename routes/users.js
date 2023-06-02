const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
let ejs = require('ejs');
require("../config/passport")(passport)
const {ensureAuthenticated} = require('../config/auth') 
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(express.json());
const multer = require("multer");




//connecting to the localhost
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
    console.log('Connected to database in users');
});



var user_id;
router.post('/create',(req,res)=>{
  //  const email = req.body.useremail;
  //  console.log(email);
  //  connection.query('SELECT id FROM user WHERE email = ?', [email], function (error, results) {
  // //  user_id = results[0].id;
  
  //  console.log(user_id);
  //  });
   user_id = req.user.id;
   console.log(user_id);
   const mapping_name = req.body.mapping_name;
   console.log(mapping_name);
   const targetFormat = req.body.targetFormat;
   const mapping = req.body.mapping_data;
   console.log(mapping);
   const template = req.body.template;
   console.log(template);

  //  const data = JSON.parse(mapping);

  const sql = 'INSERT INTO mapping (mapping_name, mapping, user_id,targetFormat,template) VALUES (?, ?, ?, ?, ?)';
  const values = [mapping_name, mapping, user_id, targetFormat,template];


  connection.query(sql, values, (err, result) => {
  if (err) {
      console.error('Error inserting data into database: ' + err.stack);
      return;
    }
  else{
    console.log('Data inserted successfully');
    req.flash('success_msg','created new mapping -->' + mapping_name)
    res.redirect('/selecting');
    
  }
  });
});




router.get('/login',(req,res)=>{
  
  res.render('login');
});


router.get('/register',(req,res)=>{
  res.render('register', { name: '', email: '', errors: [] });
});


router.post('/login',(req,res,next)=>{
  const username = req.body.email;
  req.session.username = username;
    passport.authenticate('local',{
    successRedirect : '/selecting',
    failureRedirect : '/users/login',
    failureFlash : true,
    })(req,res,next);
});


//post request handle for register page
router.post('/register',async (req,res)=>{
    const name = req.body.userName;
    const email = req.body.email;
    const password = req.body.password;
    const rePassword = req.body.repassword;

    let errors = [];
    console.log(name,email,password);
  

  // Checking if all the fields are filled or not
  if (!name || !email || !password || !rePassword) {
    errors.push({message : 'Fill all the fields'});
    res.render('register', {
      errors : errors
      })
}

// Checking the email is valid or not
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      errors.push({message : "Email is not valid"});
      res.render('register', {
        errors : errors
        })
  }


  // Checking for the strong password
  if (password.length <8) {
    errors.push({message : "Password is too short"});
    res.render('register', {
      errors : errors
      })
  }

  // Checking for password and re-password is matching or not 
  if (password !== rePassword) {
    errors.push({message : "Re-password are not matching"});
    res.render('register', {
      errors : errors
      })
  }

  //if errors are there then render the register page with errror
    if(errors.length > 0 ) {
      res.render('register', {
          errors : errors
          })
      }
    else{
      //searching if email already in database or not
    connection.query('SELECT * FROM user WHERE email = ?', [email], async (err, result) => {
      if (err) {
          throw err;
      }

      if (result.length > 0) {
          errors.push({ message: 'Email already exist'});
          res.render('register', { errors: errors, name, email });
      } 
      else {
            //encrypting the passowrd with bcrypt function
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            //creating a unique id
            const userId = uuidv4();
            const hashPassword = hashedPassword
      
            //inserting a new user into database
            const sql = 'INSERT INTO user (id,userName, email, password) VALUES (?, ?, ?, ?)';
            const values = [userId, name, email, hashPassword];

            connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error inserting data into database: ' + err.stack);
                return;
              }
            else{
              console.log('Data inserted successfully');
              // errors.push({ message: 'registered successfully'});
              // res.render('register', { name: '', email: '', errors});
              req.flash('success_msg','You have now registered!')
              res.redirect('/users/login');
            }
          });
        }
      });
    }
  });




//user logout

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/users/login');
  });
});
// router.get('/logout',(req,res)=>{
//   req.logout();
//   req.flash('success_msg','Now logged out');
//   res.redirect('/users/login');
//  });


router.get('/myfiles',(req,res,next)=>{
  var user_id = req.user.id;
  console.log(user_id);
  const sql = 'SELECT id, file, filename, converted_time FROM files WHERE user_id = ?';
  connection.query(sql, [user_id], (error, results) => {
    if (error) {
      // Handle the error appropriately
      console.error(error);
      return next(error);
    }

    const files = results; // Assuming the query returns an array of file objects

    // Render the 'mypage' template and pass the 'files' data to it
    res.render('mypage', { files: files });
  });

  
});



router.post('/processdropdown', (req, res) => {
  const selectedValue = req.body.selectedValue;
  connection.query('SELECT mapping, targetFormat, template FROM mapping WHERE mapping_name = ?', [selectedValue], function (error, results) {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Mapping not found' });
      return;
    }

    const fetched_value = results[0].mapping;
    const targetFormat = results[0].targetFormat;
    const template = results[0].template;

    res.json({ fetched_value, targetFormat,template });
  });
});

router.post('/fileUpload',(req,res,next)=>{
  const data = (req.body.json);
  const filename = req.body.filename;
  console.log(typeof(data));
  console.log(filename);
  console.log(data);
  const user_id = req.user.id;
  console.log(user_id);
  const sql = 'INSERT INTO files (file, user_id,filename) VALUES (?, ?, ?)';
  const values = [data , user_id, filename];
  
  connection.query(sql, values, (err, result) => {
      if (err) {
          console.error('Error inserting data into database: ' + err.stack);
          return;
      }
      else{
      console.log('Data inserted successfully');
      }
  });
  
  
  
  });

  router.get('/download/:id', (req, res) => {
    const fileId = req.params.id;
  
   
    const sql = 'SELECT file, filename FROM files WHERE id = ?';
    connection.query(sql, [fileId], (error, results) => {
      if (error) {
      
        console.error(error);
        return next(error);
      }
  
      if (results.length === 0) {
     
        return res.status(404).send('File not found');
      }
  
      const fileData = results[0];
      const fileContent = fileData.file;
      const filename = fileData.filename;
  
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
      
      res.send(fileContent);
    });
  });
  




module.exports  = router;











