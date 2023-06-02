const express = require('express');
const router  = express.Router();
const {ensureAuthenticated} = require('../config/auth') 
const mysql = require('mysql2');

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
    //   console.log('Connected to database in users');
  });

router.get('/', (req,res)=>{
    res.render('home');
});

//calling register page
router.get('/register', (req,res)=>{
    res.render('register', { name: '', email: '', errors: [] });
});


var user_id;
var dropdownValues = [];
//calling dashboard page only after authenticated
router.get('/dashboard',ensureAuthenticated,(req,res)=>{
    const user_id = req.user.id;
    // connection.query('SELECT id FROM user WHERE email = ?', [email], function (error, results) {
    //     user_id = results[0].id;
    //    //  console.log(user_id);
    //     });
    console.log("user id =",user_id);
    
        connection.query('SELECT mapping_name FROM mapping WHERE user_id = ?', [user_id], function (error, results) {
            console.log("results= ",results);
            dropdownValues = results.map(obj => obj.mapping_name);

            res.render('dashboard',{
                user: req.user , dropdownValues:dropdownValues
                });
        });
    // const dropdownValues = ['Option 1', 'Option 2', 'Option 3','teju', 'kevin','ishan'];
    // console.log("dropdown= ",dropdownValues);

    // res.render('dashboard',{
    //     user: req.user , dropdownValues:dropdownValues
    //     });

});




router.get('/selecting',ensureAuthenticated,(req,res)=>{
    res.render('selecting',{
        user: req.user
        });
    })

router.get('/create',ensureAuthenticated,(req,res)=>{
        res.render('create',{
            user: req.user
            });
        })


module.exports = router; 