'use strict';
let db = require('diskdb');
let bcrypt  = require('bcrypt-nodejs');
let path = require('path');

class Dbutils {
    constructor(){
        db = db.connect(path.join(__dirname, '..', 'database'), ['securityprincipal', 'projects']);
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

    findAllProjects(obj){
        return db.projects.find(obj);
    }

    updateProject(query, obj, options){
        return db.projects.update(query, obj);
    }

    findAllSP(obj){
        console.log('here');
        return db.securityprincipal.find(obj);
    }

    insertSP(obj){
        return db.securityprincipal.save(obj);
    }
}

const dbutils = new Dbutils();


module.exports = dbutils;



