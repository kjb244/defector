'use strict';

let express = require('express');
let router = express.Router();
let path = require('path');
let db = require('diskdb');
let dbutils = require('../utils/dbutils.js');


db = db.connect(path.join(__dirname, '..', 'database'), ['securityprincipal', 'projects']);

let sessionChecker = (req, res, next) => {
    console.log('session checker', req.session.user);
    if (req.session.user) {
        next();
    } else {
        return res.json({redirectUrl: '/'})
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
    req.session.destroy();
    res.redirect('/');
});

router.get('/', function (req, res, next) {

    res.redirect('signuplogin');
});

router.get('/signuplogin', function (req, res, next) {
    res.render('signuplogin', {title: 'Express'});
});

router.get('/getchatdata', function (req, res, next) {
    let hash = req.query['hash'];
    let user = req.session.user;
    let projectArr = dbutils.findAllProjects({project: hash});
    if (projectArr.length){
        let obj = {comments: projectArr[0].details.comments, user};
        return res.json(obj);
    }
    return res.json({});
});

router.get('/getdefects', function (req, res, next) {
    let hash = req.query['hash'];
    let projectArr = dbutils.findAllProjects({project: hash});
    if (projectArr.length){
        return res.json({defects: projectArr[0].details.issues, user: req.session.user});
    }
    return res.json({});
});


router.get('/getusers', function (req, res, next) {
    let securityPrincArr = dbutils.findAllSP({});
    let rtnObj = securityPrincArr.map(function(e){
        return e.email.substring(0,2);
    })
    return res.json(rtnObj);
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
    let data = req.body.data;
    let userFound = dbutils.findAllSP({email: data.email, password: data.password});
    if (userFound.length) {
        req.session.user = data.email;
        res.json({status: 'valid'});
        req.io.emit('user login', {email: data.email});
    }
});

router.post('/claimchange',sessionChecker, function (req, res, next) {

    let data = req.body.data;

    let projectArr = dbutils.findAllProjects({project: data.hash});
    if (projectArr.length){

        let details = projectArr[0].details;
        let recordKey = details.issues.findIndex((e)=> { return e.name === data.currRow.name});
        details.issues[recordKey].claimedBy = req.session.user;
        dbutils.updateProject({project: data.hash}, {details: details});
        req.io.emit('claim update', {data: details.issues[recordKey], touchedBy: req.session.user});



    }
    res.json({});


});

router.post('/changestatus',sessionChecker, function (req, res, next) {
    let data = req.body.data;
    let projectArr = dbutils.findAllProjects({project: data.hash});
    if (projectArr.length){
        let details = projectArr[0].details;
        let recordKey = details.issues.findIndex((e)=> { return e.name === data.currRow.name});
        details.issues[recordKey].status = data.status;
        details.issues[recordKey].claimedBy = data.claimedBy;
        dbutils.updateProject({project: data.hash}, {details: details});
        req.io.emit('change status', {data: details.issues[recordKey], touchedBy: req.session.user});



    }
    res.json({});


});

router.post('/notechange',sessionChecker, function (req, res, next) {
    let data = req.body.data;
    let projectArr = dbutils.findAllProjects({project: data.hash});
    if (projectArr.length){
        let details = projectArr[0].details;
        let recordKey = details.issues.findIndex((e)=> { return e.name === data.currRow.name});
        details.issues[recordKey].notes = data.currRow.notes;
        dbutils.updateProject({project: data.hash}, {details: details});
        req.io.emit('note update', {data: details.issues[recordKey], touchedBy: req.session.user});



    }
    res.json({});


});

router.post('/submitmessage',sessionChecker, function(req, res,next){
    let data = req.body.data;
    let user = req.session.user;
    //store in db
    let projectArr = dbutils.findAllProjects({project: data.hash});
    if (projectArr.length){
        let node =projectArr[0].details;
        node.comments.push({message: data.message,user: user || 'unknown', time: new Date().getTime()});

        dbutils.updateProject({project: data.hash}, {details: node});

        req.io.emit('chat message', node.comments[node.comments.length-1]);


    }




    res.json({});


});

router.post('/createproject', sessionChecker, function (req, res, next) {
    let data = req.body.data;
    let issues = data.issues || [];


    let obj = {
        project: data.projectname,
        details: {
            issues: issues.map((e) => {
                e.notes = '';
                e.status = 'open';
                e.claimedBy = '';
                return e;
            }),
            comments: []
        }
    }

    let projectArr = dbutils.findAllProjects({project: data.projectname});
    console.log(data.projectname);
    if (!projectArr.length) {

        db.projects.save(obj);
    }

    res.json({project: data.projectname});
});

router.get('/createselectproject', sessionChecker, function (req, res, next) {
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
