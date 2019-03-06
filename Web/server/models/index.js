var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var basename = path.basename(__filename);
var env = process.env.CUISTO_ENV || 'development';
var config = require(__dirname + '/../config/config.js')[env];
var db = {};
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const errMsg = require('../middleware/messages');

var sequelize = new Sequelize(process.env.CLEARDB_DATABASE_URL, {
    dialect: 'mysql',
    operatorsAliases: false,
    define: {
        timestamps: false
    },
    logging: false
});

var sections = ['Restaurant', 'Inventaire', 'Alimentation', 'Employe', 'Client']

sections.forEach((section) => {
    var sectionPath = __dirname + `/${section}/`;
    fs
        .readdirSync(sectionPath)
        .filter(file => {
            return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
        })
        .forEach(file => {
            var model = sequelize['import'](path.join(sectionPath, file));
            db[model.name.replace(/^\w/, c => c.toUpperCase())] = model;
        });
});

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

///// ASSOCIATIONS
///// Associations between tables must be made in order for us to be able to include the parent object into the child
///// Ref: https://stackoverflow.com/a/25072476/4918541
/////      http://docs.sequelizejs.com/manual/tutorial/associations.html#associations
///// Legend (See refs to know which method is the right one):
/////   1:N ---> 
/////   N:M <--> 
/////   1:1 ---- 
/////   N:1 <---

// Restaurant ---> Salle
db.Restaurant.hasMany(db.Salle, { foreignKey: 'Restaurant_id' });
db.Salle.belongsTo(db.Restaurant, { foreignKey: 'Restaurant_id' });

// Salle ---> Table
db.Salle.hasMany(db.Table, { foreignKey: 'Salle_id' });
db.Table.belongsTo(db.Salle, { foreignKey: 'Salle_id' });

// Employe ---> Quart
db.Employe.hasMany(db.Quart, { foreignKey: 'Employe_id' });
db.Quart.belongsTo(db.Employe, { foreignKey: 'Employe_id' });

// Quart ---- Punch
db.Quart.hasOne(db.Punch, { foreignKey: 'Quart_id' });
db.Punch.belongsTo(db.Quart, { foreignKey: 'Quart_id' });

// Restaurant ---> Fournisseur
db.Restaurant.hasMany(db.Fournisseur, { foreignKey: 'Restaurant_id' });
db.Fournisseur.belongsTo(db.Restaurant, { foreignKey: 'Restaurant_id' });

// Restaurant ---> Menu
db.Restaurant.hasMany(db.Menu, { foreignKey: 'Restaurant_id' });
db.Menu.belongsTo(db.Restaurant, { foreignKey: 'Restaurant_id' });

// Menu ---> Item
db.Menu.hasMany(db.Item, { foreignKey: 'Menu_id' });
db.Item.belongsTo(db.Menu, { foreignKey: 'Menu_id' });

// Employe ---> Commande
db.Employe.hasMany(db.Commande, { foreignKey: 'Employe_id' });
db.Commande.belongsTo(db.Employe, { foreignKey: 'Employe_id' });

// Table ---> Commande
db.Table.hasMany(db.Commande, { foreignKey: 'Table_id' });
db.Commande.belongsTo(db.Table, { foreignKey: 'Table_id' });

// Restaurant ---> Reservation
db.Restaurant.hasMany(db.Reservation, { foreignKey: 'Restaurant_id' });
db.Reservation.belongsTo(db.Restaurant, { foreignKey: 'Restaurant_id' });

// Restaurant ---> Facture
db.Restaurant.hasMany(db.Facture, { foreignKey: 'Restaurant_id' });
db.Facture.belongsTo(db.Restaurant, { foreignKey: 'Restaurant_id' });

// Organisation ---> Restaurant
db.Organisation.hasMany(db.Restaurant, { foreignKey: 'Organisation_id' });
db.Restaurant.belongsTo(db.Organisation, { foreignKey: 'Organisation_id'});

// Organisation ---> Poste
db.Organisation.hasMany(db.Poste, { foreignKey: 'Organisation_id' });
db.Poste.belongsTo(db.Organisation, { foreignKey: 'Organisation_id'});

// Restaurant ---> Employe
db.Restaurant.hasMany(db.Employe, { foreignKey: 'Restaurant_id' });
db.Employe.belongsTo(db.Restaurant, { foreignKey: 'Restaurant_id' });

// Poste ---> Employe
db.Poste.hasMany(db.Employe, { foreignKey: 'Poste_id'});
db.Employe.belongsTo(db.Poste, {foreignKey: 'Poste_id'});

// Restaurant ---> Article
db.Restaurant.hasMany(db.Article, {foreignKey: 'Restaurant_id'});
db.Article.belongsTo(db.Restaurant, {foreignKey: 'Restaurant_id'});

// Fournisseur ---> CommandeFournisseur
db.Fournisseur.hasMany(db.CommandeFournisseur, {foreignKey: 'Fournisseur_id'});
db.CommandeFournisseur.belongsTo(db.Fournisseur, {foreignKey: 'Fournisseur_id'});

// Article <--> Fournisseur
db.Article.belongsToMany(db.Fournisseur, {through: db.ListeFournisseur, foreignKey: 'Article_id'});
db.Fournisseur.belongsToMany(db.Article, {through: db.ListeFournisseur, foreignKey: 'Fournisseur_id'});

// Commande <--> Item
db.Commande.belongsToMany(db.Item, {through: db.CommandeItem, foreignKey: 'Commande_id'});
db.Item.belongsToMany(db.Commande, {through: db.CommandeItem, foreignKey: 'Item_id'});

// Article <--> CommandeFournisseur
db.Article.belongsToMany(db.CommandeFournisseur, {through: db.CommandeArticle, foreignKey: 'Article_id'});
db.CommandeFournisseur.belongsToMany(db.Article, {through: db.CommandeArticle, foreignKey: 'CommandeFournisseur_id'});

/**
 * Automatically makes table joins based on its foreign keys
 * @param {Sequelize.Model} base the base table to check for joins
 * @returns {Sequelize.Model} entry with foreign keys excluded and includes made
 */
function MakeJoins(base) {
    var join = {
        include: [],
        attributes: {
            exclude: []
        }
    };
    var fks = [];
    for (const col in base.rawAttributes) {
        if (base.rawAttributes.hasOwnProperty(col)) {
            var element = base.rawAttributes[col];
            if (element.hasOwnProperty('references'))
                fks.push(element);
        }
    }
    fks.forEach((fk) => {
        var j = {
            model: db[fk.references.model],
            include: [],
            attributes: {
                exclude: []
            }
        };
        var fkJoins = MakeJoins(db[fk.references.model]);
        j.include = fkJoins.include;
        j.attributes = fkJoins.attributes;
        // Exclude any password from a joined table (because it doesnt get filtered out by default with toJSON)
        j.attributes.exclude.push('password');
        join.include.push(j);
        join.attributes.exclude.push(fk.field);
    });
    return join;
}

/**
 * Finds one entry that matches the query
 * @param {Sequelize.where} where query to match the entry to
 * @returns {Sequelize.Model} entry
 */
function findOneFull(where) {
    var joins = MakeJoins(this);
    return this.findOne({
        where: where || {},
        include: joins.include,
        attributes: joins.attributes
    });
}

/**
 * Creates and saves an instance to the DB and returns the full object
 * @param {Object} params model parameters to insert
 * @returns {Promise<Sequelize.Model>} instance
 */
async function createFull(params) {
    return this.findOneFull({ id: (await this.create(params)).id });
}

/**
 * Updates and saves an instance to the DB and returns the full object
 * @param {Object} params model parameters to update
 * @returns {Promise<Sequelize.Model>} instance
 */
async function updateFull(params) {
    var model = db[this._modelOptions.tableName];
    var instance = await this.update(params);
    if(!instance) return Promise.reject();
    return model.findOneFull({ id: instance.id });
}

// Used to attach custom methods to every model (See functions above)
for (var model in db) {
    if (db.hasOwnProperty(model) && model.toLowerCase() != "sequelize") {
        db[model].findOneFull = findOneFull;
        db[model].createFull = createFull;
        db[model].prototype.updateFull = updateFull;
    }
}

// Organisation Authentification
db.Organisation.prototype.generateAuthToken = async function () {
    var organisation = this;

    var tokenStr = jwt.sign({
        Organisation_id: organisation.id,
        access: 'auth'
    }, process.env.JWT_SECRET).toString();

    return (await db.Token.create({
        token: tokenStr,
        Organisation_id: organisation.id
    })).token;
}

// Organisation Forget
db.Organisation.prototype.generateForgetToken = async function () {
    var organisation = this;

    var tokenStr = jwt.sign({
        Organisation_id: organisation.id,
        access: 'forget'
    }, process.env.JWT_SECRET).toString();

    return (await db.Token.create({
        token: tokenStr,
        Organisation_id: organisation.id
    })).token;
}

db.Organisation.prototype.removeToken = function (token) {
    if (typeof token !== "string") return Promise.reject(errMsg.TOKEN_NOT_STRING);
    return db.Token.destroy({
        where:
        {
            token
        }
    });
}

db.Organisation.findByToken = async function (token, forget = false) {
    if (typeof token !== "string") return Promise.reject(errMsg.TOKEN_NOT_STRING);
    var Organisation = this;

    var decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.access != 'auth' && decoded.access != "forget") return Promise.reject(errMsg.UNKNOWN_TOKEN_ACCESS);
        if(decoded.access == "forget" && !forget) return Promise.reject(errMsg.INVALID_TOKEN_ACCESS);
        token = await db.Token.findOne({where: {
            token,
            Organisation_id: decoded.Organisation_id
        }});
        if(!token) return Promise.reject(errMsg.TOKEN_NOT_FOUND);
        return Organisation.findOneFull({ id: token.Organisation_id });
    } catch (err) {
        return Promise.reject(errMsg.FINDBYTOKEN_ERROR);
    }
}

db.Organisation.findByCredentials = async function (username, password) {
    var Organisation = this;
    var organisation = await Organisation.findOne({
        where: 
        {
            [Op.or]:
            [
                {
                    username
                },
                {
                    courriel: username
                }
            ]
        }
    });
    if(!organisation) return Promise.reject(errMsg.INVALID_CREDENTIALS);

    return new Promise((resolve, reject) => {
        bcrypt.compare(password, organisation.password, (err, res) => {
            if(res)
                resolve(organisation);
            else 
                reject(errMsg.INVALID_CREDENTIALS);
        });
    });
}

db.Organisation.findByUsername = function (username) {
    var Organisation = this;
    return Organisation.findOne({
        where: 
        {
            [Op.or]:
            [
                {
                    username
                },
                {
                    courriel: username
                }
            ]
        }
    });
}

//  Employe Authentification
db.Employe.prototype.generateAuthToken = async function () {
    var employe = this;

    var tokenStr = jwt.sign({
        Employe_id: employe.id,
        access: 'auth'
    }, process.env.JWT_SECRET).toString();

    return (await db.Token.create({
        token: tokenStr,
        Employe_id: employe.id
    })).token;
}

//  Employe Forget
db.Employe.prototype.generateForgetToken = async function () {
    var employe = this;

    var tokenStr = jwt.sign({
        Employe_id: employe.id,
        access: 'forget'
    }, process.env.JWT_SECRET).toString();

    return (await db.Token.create({
        token: tokenStr,
        Employe_id: employe.id
    })).token;
}

db.Employe.prototype.removeToken = function (token) {
    if (typeof token !== "string") return Promise.reject(errMsg.TOKEN_NOT_STRING);
    return db.Token.destroy({
        where:
        {
            token
        }
    });
}

db.Employe.findByToken = async function (token, forget = false) {
    if (typeof token !== "string") return Promise.reject(errMsg.TOKEN_NOT_STRING);
    var Employe = this;

    var decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.access != 'auth' && decoded.access != "forget") return Promise.reject(errMsg.UNKNOWN_TOKEN_ACCESS);
        if(decoded.access == "forget" && !forget) return Promise.reject(errMsg.INVALID_TOKEN_ACCESS);
        token = await db.Token.findOne({where: {
            token,
            Employe_id: decoded.Employe_id
        }});
        if(!token) return Promise.reject(errMsg.TOKEN_NOT_FOUND);
        return Employe.findOneFull({ id: token.Employe_id });
    } catch (err) {
        return Promise.reject(errMsg.FINDBYTOKEN_ERROR);
    }
}

db.Employe.findByCredentials = async function (username, password) {
    var Employe = this;
    var employe = await Employe.findOne({
        where: 
        {
            [Op.or]:
            [
                {
                    username
                },
                {
                    courriel: username
                }
            ]
        }
    });
    if(!employe) return Promise.reject(errMsg.INVALID_CREDENTIALS);

    return new Promise((resolve, reject) => {
        bcrypt.compare(password, employe.password, (err, res) => {
            if(res)
                resolve(employe);
            else 
                reject(errMsg.INVALID_CREDENTIALS);
        });
    });
}

db.Employe.findByUsername = function (username) {
    var Employe = this;
    return Employe.findOne({
        where: 
        {
            [Op.or]:
            [
                {
                    username
                },
                {
                    courriel: username
                }
            ]
        }
    });
}

module.exports = db;