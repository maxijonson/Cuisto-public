var db = require('../models');
var _ = require('lodash');
var moment = require('moment');
const { Op } = require('sequelize');
const errMsg = require('./messages');

function GetParentModel(req) {
    var modelName = req.baseUrl.substr(req.baseUrl.lastIndexOf('/') + 1).replace(/^\w/, c => c.toUpperCase());
    if (!db.hasOwnProperty(modelName)) return null;
    return db[modelName];
}

function GetChildModel(req) {
    var modelName = req.path.substr(req.path.lastIndexOf('/') + 1).replace(/^\w/, c => c.toUpperCase());
    if (!db.hasOwnProperty(modelName)) return null;
    return db[modelName];
}

function isDateOnly(element) {
    return element.type.constructor.name.includes("DATEONLY");
}

function isDate(element) {
    return element.type.constructor.name.includes("DATE");
}

function isTime(element) {
    element.type.constructor.name.includes("TIME");
}

function buildParams(req, model) {
    var paramsName = [];
    // May or may not exist
    var parentKey = null;
    // e.g: Date types that need to be parsed before
    var specialKeys = [];
    // Now we need to load the appropriate params
    for (const col in model.rawAttributes) {
        if (model.rawAttributes.hasOwnProperty(col)) {
            var element = model.rawAttributes[col];
            // We dont need the autoincremented property
            if (!element.hasOwnProperty('autoIncrement')) {
                if (element.hasOwnProperty('references')) {
                    // If a column is for a foreign key, we assume that 'checkExist' has been called before this middleware and that req.instance is not null
                    // this should run either never or only once!
                    if (element.fieldName.includes(req.instance._modelOptions.tableName))
                        parentKey = {
                            key: element.fieldName,
                            value: req.instance.id
                        };
                    else
                        paramsName.push(element.fieldName);
                } else if (isDateOnly(element)) {
                    specialKeys.push({
                        key: element.fieldName,
                        value: (val) => {
                            return moment(val, "YYYY-MM-DD").format("YYYY-MM-DD");
                        }
                    });
                    paramsName.push(element.fieldName);
                } else if (isDate(element)) {
                    specialKeys.push({
                        key: element.fieldName,
                        value: (val) => {
                            return moment(val, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm");
                        }
                    });
                    paramsName.push(element.fieldName);
                } else if (isTime(element)) {
                    specialKeys.push({
                        key: element.fieldName,
                        value: (val) => {
                            return moment(val, "HH:mm").format("HH:mm");
                        }
                    });
                } else // we push it as a param name that we will pick out of the req.body
                    paramsName.push(element.fieldName);
            }
        }
    }
    var params = _.pick(req.body, paramsName);
    if (parentKey) params[parentKey.key] = parentKey.value;
    specialKeys.forEach(sk => {
        params[sk.key] = sk.value(params[sk.key]);
    });
    return params;
}

var checkExist = async (req, res, next) => {
    if (!req.params.id) return res.status(500).send(errMsg.INTERNAL);
    var id = req.params.id;
    var model = GetParentModel(req);

    var instance = await model.findOneFull({ id });
    if (!instance) return res.status(404).send(errMsg.INSTANCE_NOT_FOUND);
    req.instance = instance;
    next();
}

function GetParamNames (model) {
    var paramsName = [];
    // Now we need to load the appropriate params
    for (const col in model.rawAttributes) {
        if (model.rawAttributes.hasOwnProperty(col)) {
            var element = model.rawAttributes[col];
            // We dont need the autoincremented property
            if (!element.hasOwnProperty('autoIncrement')) {
                paramsName.push(element.fieldName);
            }
        }
    }
    return paramsName;
}

var filterRequestBodyForChildren = (req, res, next) => {
    var model = GetChildModel(req);
    var paramsName = GetParamNames(model);
    req.body = _.pick(req.body, paramsName);
    next();
}

var filterRequestBodyForParent = (req, res, next) => {
    var model = GetParentModel(req);
    var paramsName = GetParamNames(model);
    req.body = _.pick(req.body, paramsName);
    next();
}

var create = async (req, res, next) => {
    try {
        // This will try to understand which model has to be created
        var model = req.params.id ? GetChildModel(req) : GetParentModel(req);
        var params = buildParams(req, model);
        var instance = await model.createFull(params);
        res.status(200).send(instance);
        next();
    } catch (err) {
        return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
};

var read = async (req, res, next) => {
    res.status(200).send(req.instance);
    next();
};


var update = async (req, res, next) => {
    try {
        // This will try to understand which model has to be created
        var model = GetParentModel(req);
        var params = buildParams(req, model);
        var instance = await req.instance.updateFull(params);
        res.status(200).send(instance);
        next();
    } catch (err) {
        return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
};

var del = async (req, res, next) => {
    try {
    await req.instance.destroy();
    res.status(200).send(req.instance);
    } catch(err) {
        return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
};

module.exports = { checkExist, create, read, update, del, filterRequestBodyForChildren, filterRequestBodyForParent };