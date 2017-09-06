'use strict';
let db = require('diskdb');
let bcrypt  = require('bcrypt-nodejs');
let path = require('path');

class Sputils {
    constructor(){
        db = db.connect(path.join(__dirname, '..', 'database'), ['securityprincipal']);
    }

     generateHash(password){
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    }

    validPassword(password, email){
         console.log('validating pw');
        let user = db.securityprincipal.find({'email': email});
        if (user.length){
            return bcrypt.compareSync(password, user.password);
        }
        return false;

    }

    findAllSP(obj){
        console.log('here');
        return db.securityprincipal.find(obj);
    }

    insertSP(obj){
        return db.securityprincipal.save(obj);
    }
}

const sputils = new Sputils();


module.exports = sputils;



