var router = require('express').Router();
const _ = require('lodash');
const moment = require('moment');
const Op = require('sequelize').Op;
var { Fournisseur, CommandeFournisseur, CommandeArticle, Article, Restaurant, Organisation, ListeFournisseur } = require('./../../../models');
var { checkExist, read, update, del, filterRequestBodyForParent } = require('../../../middleware/utils');
var { authenticate, asAdmin, checkMembership } = require('../../../middleware/authenticate');
const errMsg = require('../../../middleware/messages');

// List fournisseurs of a restaurant
router.get('/liste', authenticate, asAdmin, async (req, res) => {
    try {
        if (!req.session.rid) return res.status(400).send(errMsg.SESSION_RID_NOT_FOUND);
        var where = { Restaurant_id: req.session.rid };

        if (req.query.q) {
            where[Op.or] = {
                nom: { [Op.like]: `%${req.query.q}%` },
                adresse: { [Op.like]: `%${req.query.q}%` },
                telephone: { [Op.like]: `%${req.query.q}%` },
                personneRessource: { [Op.like]: `%${req.query.q}%` },
                courriel: { [Op.like]: `%${req.query.q}%` }
            }
        }
        if (req.query.nom)
            where.nom = { [Op.like]: `%${req.query.nom}%` };
        if (req.query.adresse)
            where.adresse = { [Op.like]: `%${req.query.adresse}%` };
        if (req.query.telephone)
            where.telephone = { [Op.like]: `%${req.query.telephone}%` };
        if (req.query.personneRessource)
            where.personneRessource = { [Op.like]: `%${req.query.personneRessource}%` };
        if (req.query.courriel)
            where.courriel = { [Op.like]: `%${req.query.courriel}%` };

        var fournisseurs = await Fournisseur.findAll({
            where,
            include:
                [
                    {
                        model: Article,
                        attributes:
                        {
                            exclude: ['Restaurant_id']
                        },
                        through:
                        {
                            attributes: ['prix']
                        }
                    }
                ],
            attributes:
            {
                exclude: ['Restaurant_id']
            }
        });
        res.status(200).send({ fournisseurs });
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// POST /:id/commande (Create fournisseur commande)
router.post('/:id/commande', checkExist, authenticate, checkMembership, async (req, res) => {
    try {
        var params = _.pick(req.body, ['articles']);
        var articles = params.articles;

        var cf = await CommandeFournisseur.createFull({
            date: moment().format("YYYY-MM-DD"),
            Fournisseur_id: req.instance.id
        });

        var ca = [];
        articles.forEach(article => {
            ca.push({
                Article_id: article.id,
                CommandeFournisseur_id: cf.id,
                quantite: article.quantite
            });
        });

        await CommandeArticle.bulkCreate(ca);
        var commande = (await CommandeFournisseur.findOne({
            where:
            {
                id: cf.id
            },
            include:
                [
                    {
                        model: Article,
                        through:
                        {
                            attributes: ['quantite']
                        }
                    }
                ]
        })).toJSON();

        try {
            var total = 0;
            for(var article of commande.Articles) {
                article.CommandeArticle.prix = (await ListeFournisseur.findOne({
                    where:
                    {
                        Fournisseur_id: req.instance.id,
                        Article_id: article.id
                    }
                })).prix;
                article.CommandeArticle.total = Number(article.CommandeArticle.quantite * article.CommandeArticle.prix).toFixed(2);
                total += Number(article.CommandeArticle.total);
            }
            commande.total = total.toFixed(2);
        } catch (err) {
            return res.status(400).send(errMsg.CUSTOM("Erreur lors de l'obtention du prix d'un article. L'article n'est probablement pas fourni par ce fournisseur"));
        }

        res.status(200).send({ commande });
    } catch (err) {
        console.log(err.message);
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// POST / (CREATE)
router.post('/', authenticate, asAdmin, filterRequestBodyForParent, async (req, res) => {
    try {
        if (!req.session.rid) return res.status(400).send(errMsg.RESTO_NOT_FOUND);
        req.body.Restaurant_id = req.session.rid;
        var fournisseur = await Fournisseur.createFull(req.body);
        res.status(200).send(fournisseur);
    } catch (err) {
        res.status(400).send();
    }
});

// GET /:id (READ)
router.get('/:id', checkExist, authenticate, asAdmin, checkMembership, async (req, res) => {
    try {
        var fournisseur = await Fournisseur.findOne({
            where:
            {
                id: req.instance.id
            },
            include:
                [
                    {
                        model: Article,
                        attributes:
                        {
                            exclude: ['Restaurant_id']
                        },
                        through:
                        {
                            attributes: ['prix']
                        }
                    }
                ],
            attributes:
            {
                exclude: ['Restaurant_id']
            }
        });
        res.status(200).send(fournisseur);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// PATCH /:id (UPDATE)
router.patch('/:id', checkExist, authenticate, asAdmin, checkMembership, filterRequestBodyForParent, async (req, res) => {
    try {
        await req.instance.update(req.body);
        var fournisseur = await Fournisseur.findOne({
            where:
            {
                id: req.instance.id
            },
            include:
                [
                    {
                        model: Article,
                        attributes:
                        {
                            exclude: ['Restaurant_id']
                        },
                        through:
                        {
                            attributes: ['prix']
                        }
                    }
                ],
            attributes:
            {
                exclude: ['Restaurant_id']
            }
        });
        res.status(200).send(fournisseur);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// DELETE /:id (DELETE)
router.delete('/:id', checkExist, authenticate, asAdmin, checkMembership, async (req, res) => {
    try {
        var fournisseur = await Fournisseur.findOne({
            where:
            {
                id: req.instance.id
            },
            include:
                [
                    {
                        model: Article,
                        attributes:
                        {
                            exclude: ['Restaurant_id']
                        },
                        through:
                        {
                            attributes: ['prix']
                        }
                    }
                ],
            attributes:
            {
                exclude: ['Restaurant_id']
            }
        });
        await fournisseur.destroy();
        res.status(200).send(fournisseur);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

module.exports = router;