var router = require('express').Router();
const _ = require('lodash');
const moment = require('moment');
const Op = require('sequelize').Op;
var { CommandeFournisseur, ListeFournisseur, Article, Fournisseur, Restaurant, Organisation, CommandeArticle } = require('./../../../models');
var { checkExist, update, del, filterRequestBodyForParent } = require('../../../middleware/utils');
var { authenticate, asAdmin, checkMembership } = require('../../../middleware/authenticate');
const errMsg = require('../../../middleware/messages');

const INCLUDE = [
    {
        model: Article,
        through:
        {
            attributes: ['quantite']
        },
        attributes: 
        {
            exclude: ['Restaurant_id']
        }
    },
    {
        model: Fournisseur,
        attributes:
        {
            exclude: ['Restaurant_id']
        },
        include:
            [
                {
                    model: Restaurant,
                    include:
                        [
                            {
                                model: Organisation,
                                attributes:
                                {
                                    exclude: ['password']
                                }
                            }
                        ],
                    attributes:
                    {
                        exclude: ['Organisation_id']
                    }
                }
            ]
    }
];

function findAll(where) {
    return CommandeFournisseur.findAll({
        where,
        include: INCLUDE,
        attributes:
        {
            exclude: ['Fournisseur_id']
        }
    });
}

function findOne(where) {
    return CommandeFournisseur.findOne({
        where,
        include: INCLUDE,
        attributes:
        {
            exclude: ['Fournisseur_id']
        }
    });
}

async function price(commande) {
    var total = 0;
    for (var article of commande.Articles) {
        article.CommandeArticle.prix = (await ListeFournisseur.findOne({
            where:
            {
                Fournisseur_id: commande.Fournisseur.id,
                Article_id: article.id
            }
        })).prix;
        article.CommandeArticle.total = Number(article.CommandeArticle.quantite * article.CommandeArticle.prix).toFixed(2);
        total += Number(article.CommandeArticle.total);
    }
    commande.total = total.toFixed(2);
}

// List fournisseurs of a restaurant
router.get('/liste', authenticate, asAdmin, async (req, res) => {
    try {
        var where = {
            '$Fournisseur.Restaurant_id$': req.session.rid
        };

        if (req.query.Fournisseur_id)
            where.Fournisseur_id = !isNaN(req.query.Fournisseur_id) ? req.query.Fournisseur_id : undefined;;

        var commandes = await findAll(where);

        var tmp = [];
        commandes.forEach(commande => {
            tmp.push(commande.toJSON());
        });
        commandes = tmp;

        for (var commande of commandes) 
            await price(commande);
        
        res.status(200).send({ commandes });
    } catch (err) {
        console.log(err.message);
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// GET /:id (READ)
router.get('/:id', checkExist, authenticate, asAdmin, checkMembership, async (req, res) => {
    try {
        var commande = (await findOne({id: req.instance.id})).toJSON();

        await price(commande);

        res.status(200).send(commande);
    } catch (err) {
        console.log(err.message);
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// PATCH /:id (UPDATE)
router.patch('/:id', checkExist, authenticate, asAdmin, checkMembership, async (req, res) => {
    try {
        var params = _.pick(req.body, ['articles']);
        var commande = await findOne({id: req.instance.id});

        // article = {id, quantite}
        if (params.articles) {
            try {
                for (var article of params.articles) {
                    if (article.hasOwnProperty('id') && article.hasOwnProperty('quantite')) {
                        console.log(`Updating article ${article.id} to ${article.quantite} from commande ${commande.id}`)
                        var ca = await CommandeArticle.update(
                            {
                                quantite: article.quantite
                            },
                            {
                            where:
                            {
                                Article_id: article.id,
                                CommandeFournisseur_id: commande.id
                            }
                        });
                        console.log(ca);
                    }
                }
            } catch (err) {
                console.log(err.message);
                return res.status(400).send(errMsg.CUSTOM("Un article spécifié n'a pas pu être modifié. Il ne fait probablement pas parti de cette commande!"));
            }
        }

        commande = (await findOne({id: req.instance.id})).toJSON();
        await price(commande);
        res.status(200).send(commande);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// DELETE /:id (DELETE)
router.delete('/:id', checkExist, authenticate, asAdmin, checkMembership, async (req, res) => {
    try {
        var commande = await findOne({
            id: req.instance.id
        });
        await commande.destroy();
        commande = commande.toJSON();
        await price(commande);

        res.status(200).send(commande);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

module.exports = router;