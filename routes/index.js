'use strict';

let express = require('express');
let router = express.Router();
let path = require('path');
let db = require('diskdb');
let dbutils = require('../utils/dbutils.js');


db = db.connect(path.join(__dirname, '..', 'database'), ['securityprincipal', 'projects']);

let sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};

router.get('/partials/:name', function (req, res) {
    let name = req.params.name;
    res.render('partials/' + name);
});

router.get('/directive_templates/:name', function (req, res) {
    let name = req.params.name;
    res.sendFile(path.join(__dirname, '../', 'views', 'directive_templates', name));
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/', sessionChecker, function (req, res, next) {

    res.redirect('signuplogin');
});

router.get('/signuplogin', function (req, res, next) {
    res.render('signuplogin', {title: 'Express'});
});

router.post('/postsignup', function (req, res, next) {
    let data = req.body.data;
    let userFound = db.securityprincipal.find({email: data.email});
    if (userFound.length) {
        res.send(JSON.stringify({status: 'user already exists'}));
    }
    else {
        db.securityprincipal.save(data);
        res.json({status: 'user created, please login'});
    }

});

router.post('/postlogin', function(req, res){
    console.log('here');
})

router.post('/createproject', function (req, res, next) {
    let data = req.body.data;
    let issues = data.issues || [];

    let obj = {
        project: data.projectname,
        details: {
            issues: issues.map((e) => {
                e.notes = '';
                return e
            }),
            comments: []
        }
    }
    let projectArr = db.projects.find({project: data.projectname});
    if (!projectArr.length) {
        db.projects.save(obj);
    }

    res.json({project: data.projectname});
});

router.get('/createselectproject', function (req, res, next) {
    res.render('createselectproject', {});
});

router.get('/getprojects', function (req, res, next) {
    let projects = db.projects.find();
    let projectArr = projects.map((e) => {
        return e.project;
    }).sort();
    res.json(projectArr);

});

router.get('/splash', function (req, res, next) {
    res.render('splash', {});
});







module.exports = router;
