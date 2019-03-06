var router = require('express').Router();
const _ = require('lodash');
const moment = require('moment');
const Op = require('sequelize').Op;

const errMsg = require('../../../middleware/messages');
var { Article, ListeFournisseur, Fournisseur, Restaurant, Organisation } = require('./../../../models');
var { checkExist, create, read, update, del } = require('../../../middleware/utils');
var { authenticate, asAdmin, checkMembership } = require('../../../middleware/authenticate');
var { filterRequestBodyForParent } = require('../../../middleware/utils');

function findAll(where) {
    return Article.findAll({
        where,
        include:
            [
                {
                    model: Fournisseur,
                    attributes:
                    {
                        exclude: ['Restaurant_id']
                    },
                    through: {
                        attributes: ["prix"]
                    }
                }
            ],
        attributes:
        {
            exclude: ['Restaurant_id']
        }
    });
}

function findOne(where) {
    return Article.findOne({
        where,
        include:
            [
                {
                    model: Fournisseur,
                    attributes:
                    {
                        exclude: ['Restaurant_id']
                    },
                    through: {
                        attributes: ["prix"]
                    }
                },
                {
                    model: Restaurant,
                    attributes:
                    {
                        exclude: ['Organisation_id']
                    },
                    include: 
                    [
                        {
                            model: Organisation,
                            attributes:
                            {
                                exclude: ['password']
                            }
                        }
                    ]
                }
            ],
        attributes:
        {
            exclude: ['Restaurant_id']
        }
    });
}

// List articles of a restaurant
router.get('/liste', authenticate, async (req, res) => {
    try {
        if (!req.session.rid) return res.status(400).send(errMsg.SESSION_RID_NOT_FOUND);
        var where = { Restaurant_id: req.session.rid };

        if (req.query.q) {
            where[Op.or] = {
                nom: { [Op.like]: `%${req.query.q}%` },
                quantite: !isNaN(req.query.q) ? req.query.q : undefined,
                unite: { [Op.like]: `%${req.query.q}%` },
                typeArticle: { [Op.like]: `%${req.query.q}%` }
            }
        }
        if (req.query.nom)
            where.nom = { [Op.like]: `%${req.query.nom}%` };
        if (req.query.quantite)
            where.quantite = !isNaN(req.query.quantite) ? req.query.quantite : undefined;
        if (req.query.unite)
            where.unite = { [Op.like]: `%${req.query.unite}%` };
        if (req.query.typeArticle)
            where.typeArticle = { [Op.like]: `%${req.query.typeArticle}%` };

        var articles = await findAll(where);
        var restaurant = await Restaurant.findOneFull({id: req.session.rid});

        res.status(200).send({ articles, Restaurant: restaurant });
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// GET articles types
router.get('/types', authenticate, async (req, res) => {
    try {
        var articles = await Article.findAll({
            where:
            {
                Restaurant_id: req.session.rid
            }
        });
        var types = [];

        articles.forEach(article => {
            if (types.indexOf(article.typeArticle) == -1)
                types.push(article.typeArticle);
        });

        res.status(200).send({ types });
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// GET articles units
router.get('/unites', authenticate, async (req, res) => {
    try {
        var articles = await Article.findAll({
            where:
            {
                Restaurant_id: req.session.rid
            }
        });
        var unites = [];

        articles.forEach(article => {
            if (unites.indexOf(article.unite) == -1)
                unites.push(article.unite);
        });

        res.status(200).send({ unites });
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// PATCH bulk update inventaire quantities
router.patch('/inventaire', authenticate, async (req, res) => {
    try {
        req.body = _.pick(req.body, ['articles']);
        if (!req.body.articles) return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
        if (!req.body.articles instanceof Array) return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);

        var modified = [];

        for (var a of req.body.articles) {
            var newArticle = _.pick(a, ['id', 'quantite']);

            if (newArticle.id && newArticle.quantite) {
                var article = await Article.findOne({ where: { id: newArticle.id, Restaurant_id: req.session.rid } });
                if (article) {
                    if (article.quantite != newArticle.quantite) {
                        article = await article.updateFull({ quantite: newArticle.quantite });
                        modified.push(article);
                    }
                }
            }
        }
        res.status(200).send({ modified });
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// BATCH UPDATE fournisseurs (prix only)
router.patch('/fournisseurs', authenticate, asAdmin, async (req, res) => {
    try {
        req.body = _.pick(req.body, ['articles']);
        if (!req.body.articles) return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
        if (!req.body.articles instanceof Array) return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);

        var modified = [];

        for (var a of req.body.articles) {
            var newArticle = _.pick(a, ['Article_id', 'Fournisseur_id', 'prix']);

            if (newArticle.Article_id && newArticle.Fournisseur_id, newArticle.prix) {
                var lf = await ListeFournisseur.findOne({ where: { Article_id: newArticle.Article_id, Fournisseur_id: newArticle.Fournisseur_id } });
                if (lf) {
                    if (lf.prix != newArticle.prix) {
                        lf = await lf.update({ prix: newArticle.prix });
                        modified.push(await findOne({id: newArticle.Article_id}));
                    }
                }
            }
        }
        res.status(200).send({ modified });

    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// DELETE clear fournisseurs
router.delete('/:id/fournisseur/clear', checkExist, authenticate, asAdmin, checkMembership, async (req, res) => {
    try {
        var article = await findOne({ id: req.instance.id });
        await ListeFournisseur.destroy({ where: { Article_id: article.id } });
        article = await findOne({ id: req.instance.id });
        res.status(200).send(article);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// DELETE fournisseur from article
router.delete('/:id/fournisseur/:fid', checkExist, authenticate, asAdmin, checkMembership, async (req, res) => {
    try {
        var article = await findOne({ id: req.instance.id });
        var index = article.Fournisseurs.findIndex(f => f.id == req.params.fid);
        if (index == -1) res.status(404).send(errMsg.ARTICLE_FOURNISSEUR_NOT_FOUND);
        await ListeFournisseur.destroy({ where: { Fournisseur_id: req.params.fid, Article_id: article.id } });
        article = await findOne({ id: req.instance.id });
        res.status(200).send(article);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// POST /
router.post('/', authenticate, asAdmin, async (req, res) => {
    try {
        req.body = _.pick(req.body, ['nom', 'quantite', 'unite', 'typeArticle', 'Fournisseurs']);
        if (!req.session.rid) return res.status(400).send(errMsg.SESSION_RID_NOT_FOUND);
        req.body.Restaurant_id = req.session.rid;
        var article = await Article.createFull(req.body);

        if (req.body.Fournisseurs) {
            var fournisseurs = [];

            req.body.Fournisseurs.forEach(fournisseur => {
                fournisseurs.push({
                    Article_id: article.id,
                    Fournisseur_id: fournisseur.Fournisseur_id,
                    prix: fournisseur.prix
                });
            });

            await ListeFournisseur.bulkCreate(fournisseurs);
            article = await findOne({ id: article.id });
        }

        res.status(200).send(article);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// GET /:id (READ)
router.get('/:id', checkExist, authenticate, checkMembership, async (req, res) => {
    try {
        var article = await findOne({ id: req.instance.id });
        res.status(200).send(article);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// PATCH /:id (UPDATE)
router.patch('/:id', checkExist, authenticate, asAdmin, checkMembership, async (req, res) => {
    try {
        req.body = _.pick(req.body, ['nom', 'quantite', 'unite', 'typeArticle', 'Fournisseurs']);
        await req.instance.update(req.body);
        var article = await findOne({ id: req.instance.id });

        if (req.body.Fournisseurs) {
            var fournisseurs = [];
            req.body.Fournisseurs.forEach(fournisseur => {
                fournisseurs.push({
                    Article_id: article.id,
                    Fournisseur_id: fournisseur.Fournisseur_id,
                    prix: fournisseur.prix
                });
            });
            fournisseurs = fournisseurs.filter(fournisseur => article.Fournisseurs.findIndex(f => f.id == fournisseur.Fournisseur_id) == -1);
            if (fournisseurs)
                await ListeFournisseur.bulkCreate(fournisseurs);
            article = await findOne({ id: req.instance.id });
        }

        res.status(200).send(article);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// DELETE /:id (DELETE)
router.delete('/:id', checkExist, authenticate, asAdmin, checkMembership, async (req, res) => {
    try {
        var article = await findOne({ id: req.instance.id });
        await article.destroy();
        res.status(200).send(article);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

module.exports = router;