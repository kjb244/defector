'use strict';

let LocalStrategy = require('passport-local').Strategy;
let dbutils = require('../utils/dbutils.js');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        let user = dbutils.findAllSP({_id: id});
        if (user.length){
            done('', user[0]);
        }


    });

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true,
        },
        function(req, username, password, done) {
            process.nextTick(function() {
                let user = dbutils.findAllSP({'email': email});
                if(user.length){
                    return done(null, false, req.flash('signupMessage', 'That email is already in use.'));
                }
                else{
                    let user = { email: email, password: dbutils.generateHash(password)};
                    dbutils.insertSP(user);
                    return done(null, user )
                }

            });
        }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true,
        },
        function(req, email, password, done) {
            console.log('kevin');
            let user = dbutils.findAllSP({'email': email});

            if(user.length === 0){
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            }
            else if (!dbutils.validPassword(password, email)){
                return done(null, false, req.flash('loginMessage', 'Wrong password.'));
            }
            return done(null, user[0]);

        }));
};