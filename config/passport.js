const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
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
      console.log('Connected to database');
  });

  module.exports = function(passport) {
    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
        connection.query('SELECT * FROM user WHERE email = ?', [email], (err, rows) => {
            if (err) {
                return done(err);
            }
            if (!rows.length) {
                return done(null, false, { message: 'Email not registered' });
            }
            const user = rows[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return done(err);
                }
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            });
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        connection.query('SELECT * FROM user WHERE id = ?', [id], (err, rows) => {
            if (err) {
                return done(err);
            }
            done(null, rows[0]);
        });
    });
};

