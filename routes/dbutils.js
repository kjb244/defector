'use strict';
let db = require('diskdb');
let bcrypt  = require('bcrypt-nodejs');

class dbutils {
    db = db.connect(path.join(__dirname, '..', 'database'), ['securityprincipal']);

    function generateHash(password){
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    }

    function validPassword(password, email){
        let user = db.securityprincipal.find({'email': email});
        if (user.length){
            return bcrypt.compareSync(password, user.password);
        }
        return false;

    }

    function findAllSP(obj){
        return db.securityprincipal.find(obj);
    }

    function insertSP(obj){
        return db.securityprincipal.save(obj);
    }
}

const util = new dbutils();

module.exports = util;



