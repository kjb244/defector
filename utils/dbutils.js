'use strict';
let db = require('diskdb');
let bcrypt  = require('bcrypt-nodejs');
let path = require('path');
let saltRounds = 10;

class Dbutils {
    constructor(){
        db = db.connect(path.join(__dirname, '..', 'database'), ['securityprincipal', 'projects']);
    }

     generateHash(password){
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    }

    addUser(email, password){
        let salt = bcrypt.genSaltSync(saltRounds);
        let hash = bcrypt.hashSync(password, salt);
        this.insertSP({email: email, password: hash});
        return true;
    }

    userExists(email){
        let user = db.securityprincipal.find({'email': email});
        if (user.length) return true;
        return false;
    }

    validPassword(email, password){
        let user = db.securityprincipal.find({'email': email});
        if (user.length){
            return bcrypt.compareSync(password, user[0].password);
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
        return db.securityprincipal.find(obj);
    }

    insertSP(obj){
        return db.securityprincipal.save(obj);
    }
}

const dbutils = new Dbutils();


module.exports = dbutils;



