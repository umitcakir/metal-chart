const express = require('express');
const config = require('./config.json');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const https = require('https');
const server = http.Server(app);
const port = process.env.PORT || config.applicationServerPort;
const nocache = require('nocache');
const path = require("path");
const messages = require('./objects/commons/messages');
const os = require('os');
const cookieParser = require('cookie-parser');

let gfs;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: false, parameterLimit: 50000}));
//app.use(express.static(__dirname + '/web'));
app.use(nocache());
app.use(cookieParser());

// app.use(session({
//     secret: 'chart',
//     resave: true,
//     saveUninitialized: false,
//     store: new MongoStore({
//         stringify:false,
//         mongooseConnection: connection
//     }),
//     proxy:true,
//     cookie: {
//         secure: false,
//         sameSite: true
//     }
// }));


// app.use(function (req, res, next) {
//     var session_id = (req.body && req.body.sid) || req.query && req.query.sid
//     req.sessionStore && req.sessionStore.get(session_id, function (err, session) {
//         if (session) {
//             req.sessionStore.createSession(req, session)
//         }
//         return next()
//     })
// })


var securityRoute = require('./objects/routes/dataRoute');
app.use('/', securityRoute);


app.use(function (req, res, next) {
    messages.printConsoleMessage(color.FgRed, 'Requested page not exists : ' + req.url + ' from: ' + req.connection.remoteAddress);
    // res.status(404).sendFile(path.join(__dirname + '/web/error.html'));
    res.status(404).send('Requested page not exists : ' + req.url + ' from: ' + req.connection.remoteAddress);
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});

server.listen(port, function () {
    messages.printConsoleMessage(color.FgMagenta, 'Server listening on port ' + config.applicationServerPort);
    messages.printConsoleMessage(color.FgMagenta, 'Server  user : ' + os.userInfo().username);
});