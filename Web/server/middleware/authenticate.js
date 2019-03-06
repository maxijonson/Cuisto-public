
var { Employe, Organisation } = require('../models');
var db = require('../models');
var errMsg = require('./messages');

function invalidateSession(req, res, next) {
    req.session.destroy(() => {
        console.log("Session Invalidated");
        res.status(401);
        if(req.header('user-agent').includes('okhttp')) // Android
            res.send(errMsg.SESSION_INVALIDATED);
        else 
            res.redirect('/login');
    });
}

async function authenticate(req, res, next) {
    try {
        console.log(req.header('user-agent'));
        var token = req.session.token || req.header('x-auth');
        if (!token) return invalidateSession(req, res, next);
        var entity;
        
        try {
            entity = await Employe.findByToken(token);
            if (entity.admin)
                entity.type = "manager";
            else
                entity.type = "employe";
            req.oid = req.session.oid = entity.Restaurant.Organisation.id;
            req.rid = req.session.rid = entity.Restaurant.id;
        } catch (err) {
            entity = await Organisation.findByToken(token);
            entity.type = "organisation";
            req.oid = req.session.oid = entity.id;
            if(req.session.rid) req.rid = req.session.rid;
        }
        if (!entity) return invalidateSession(req, res, next);
        req.user = req.session.user = entity;
        req.token = req.session.token = token;
        next();
    } catch (err) {
        return invalidateSession(req, res, next);
    }
};

// These can only be called after authenticate
function asEmploye(req, res, next) {
    try {
        if (req.user.type != "employe") return res.status(401).send(errMsg.UNAUTHORIZED);
        next();
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
}

function asManager(req, res, next) {
    try {
        if (req.user.type != "manager") return res.status(401).send(errMsg.UNAUTHORIZED);
        next();
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
}

function asWorker(req, res, next) {
    try {
        if (req.user.type != "manager" && req.user.type != "employe") return res.status(401).send(errMsg.UNAUTHORIZED);
        next();
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
}

function asOrganisation(req, res, next) {
    try {
        if (req.user.type != "organisation") return res.status(401).send(errMsg.UNAUTHORIZED);
        next();
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
}

function asAdmin(req, res, next) {
    try {
        if (req.user.type != "manager" && req.user.type != "organisation") return res.status(401).send(errMsg.UNAUTHORIZED);
        next();
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
}

function checkMembership(req, res, next) {
    function findOID(elem) {
        for (const prop in elem.dataValues) {
            if (elem.hasOwnProperty(prop)) {
                const element = elem[prop];
                if (prop == "Organisation")
                    return element.id;
                else if (typeof element == "object")
                    return findOID(element);
            }
        }
        return null;
    }

    try {
        // Search parents until an organisation is found. The req.instance should be fully joined, otherwise, make this validation manually.
        var oid = findOID(req.instance);
        if (!oid) return res.status(500).send(errMsg.INTERNAL);
        // TODO: Check also for restaurant membership, not just organisation.
        if (req.oid != oid) return res.status(403).send(errMsg.FORBIDDEN);
        next();
    } catch (err) {
        res.status(500).send(errMsg.INTERNAL);
    }
}

module.exports = { authenticate, asEmploye, asManager, asOrganisation, asAdmin, asWorker, checkMembership };