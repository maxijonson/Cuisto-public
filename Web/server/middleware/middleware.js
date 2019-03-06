const bodyParser = require('body-parser'),
    express = require('express'),
    path = require('path'),
    session = require('express-session'),
    store = require('express-mysql-session')(session),
    cookieParser = require('cookie-parser'),
    signature = require('cookie-signature'),
    cookie = require('cookie'),
    moment = require('moment');

var error = require('./errorHandler');
var { env } = require('../config/config');
const errMsg = require('./messages');

function getStoreOptions() {
    var uri = process.env.CLEARDB_DATABASE_URL.substr(8);
    var options = {};

    options.database = uri.substr(uri.lastIndexOf('/') + 1);
    if(options.database.lastIndexOf('?') != -1)
        options.database = options.database.substr(0, options.database.lastIndexOf('?'));
    options.host = uri.substring(uri.lastIndexOf('@') + 1, uri.indexOf(options.database) - 1);
    uri = uri.substring(0, uri.indexOf(options.host) - 1);
    options.password = uri.substring(uri.indexOf(':') + 1);
    options.user = uri.substring(0, uri.indexOf(':'));
    options.port = 3306;
    options.schema = {
        tableName: 'Session',
        columnNames: {
            session_id: 'id',
            expires: 'expire',
            data: 'data'
        }
    }
    options.clearExpired = true;
    options.checkExpirationInterval = 1000 * 60; // 1 minute
    options.createDatabaseTable = true;

    return options;
}

module.exports = (app) => {
    var sessionStore = new store(getStoreOptions());

    //// PACKAGE MIDDLEWARE
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../../public')));
    app.use(cookieParser(process.env.COOKIE_SECRET));
    app.use(session({
        secret: process.env.COOKIE_SECRET,
        resave: false,
        store: sessionStore,
        saveUninitialized: false,
        name: process.env.COOKIE_NAME
    }));

    //// CUSTOM MIDDLEWARE
    if (env != 'mocha-test')
        app.use((req, response, next) => {
            console.log(`${moment().format('MMM D @ H:mm:ss')}: ${req.method} ${req.url}`);
            next();
        });
    app.use((req, res, next) => {
        if(req.session) {
            var signed = 's:' + signature.sign(req.session.id, process.env.COOKIE_SECRET);
            var data = cookie.serialize(process.env.COOKIE_NAME, signed, req.session.cookie.data);
            req.cookie = data.substring(0, data.indexOf(';'));
        }
        next();
    });
    app.use('/modules', express.static(path.join(__dirname, '../../node_modules')));

    //// ROUTES
    app.use('/api', require('../routes/api/api'));
    app.use('/', require('../routes/root'));
    app.use('/fournisseurs', require('../routes/Fournisseurs/fournisseurs'));
    app.use('/employes', require('../routes/employes/employes'));
    app.use('/plantable', require('../routes/PlanTable/plantable'));
    app.use('/restaurant', require('../routes/Restaurant/restaurant'));
    app.use('/inventaire', require('../routes/Inventaire/inventaire'));
    app.use('/item', require('../routes/Item/item'));
    app.use('/commandeFournisseur', require('../routes/commandeFournisseur/commandeFournisseur'));
    app.use('/poste', require('../routes/poste/poste'));
    app.use('/me', require('../routes/me/me'));

    // Anything else is 404
    app.route('/*')
        .get(error.e404)
        .post(error.e404)
        .patch(error.e404)
        .delete(error.e404);
}