var router = require('express').Router();
const _ = require('lodash');
const { Op } = require('sequelize');

var { Employe, Restaurant, Poste, Organisation } = require('./../../../models');
var { checkExist, create, read, filterRequestBodyForChildren, filterRequestBodyForParent } = require('../../../middleware/utils');
var { authenticate, asAdmin, checkMembership, asWorker, asManager } = require('../../../middleware/authenticate');
const errMsg = require('../../../middleware/messages');

// List employees of a restaurant
router.get('/liste', authenticate, asAdmin, async (req, res) => {
    try {
        if (!req.session.rid) return res.status(400).send(errMsg.SESSION_RID_NOT_FOUND);

        var where = { Restaurant_id: req.session.rid };

        if (req.query.q) {
            where[Op.or] = {
                nom: { [Op.like]: `%${req.query.q}%` },
                prenom: { [Op.like]: `%${req.query.q}%` },
                telephone: { [Op.like]: `%${req.query.q}%` },
                courriel: { [Op.like]: `%${req.query.q}%` },
                tauxHoraire: !isNaN(req.query.q) ? req.query.q : undefined,
                username: { [Op.like]: `%${req.query.q}%` },
                admin: req.query.q == 1 || req.query.q == 0 ? req.query.q : undefined
            }
        }
        if (req.query.nom)
            where.nom = { [Op.like]: `%${req.query.nom}%` };
        if (req.query.prenom)
            where.prenom = { [Op.like]: `%${req.query.prenom}%` };
        if (req.query.telephone)
            where.telephone = { [Op.like]: `%${req.query.telephone}%` };
        if (req.query.courriel)
            where.courriel = { [Op.like]: `%${req.query.courriel}%` };
        if (req.query.username)
            where.username = { [Op.like]: `%${req.query.username}%` };
        if (req.query.tauxHoraire)
            where.tauxHoraire = !isNaN(req.query.tauxHoraire) ? req.query.tauxHoraire : undefined;
        if (req.query.admin)
            where.admin = req.query.admin == 1 || req.query.admin == 0 ? req.query.admin : undefined;

        var employes = await Employe.findAll({
            where,
            include:
                [
                    {
                        model: Poste
                    }
                ]
        });
        res.status(200).send({
            employes
        });
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// POST / (CREATE)
router.post('/', authenticate, asAdmin, filterRequestBodyForParent, async (req, res) => {
    try {
        if (!req.session.rid) return res.status(400).send(errMsg.SESSION_RID_NOT_FOUND);
        req.body.Restaurant_id = req.session.rid;
        // Check that poste belongs to this organisation
        if (req.body.Poste_id) {
            var poste = await Poste.findOne({
                where:
                {
                    [Op.and]:
                        [
                            {
                                Organisation_id: req.session.oid
                            },
                            {
                                id: req.body.Poste_id
                            }
                        ]
                }
            });
            if (!poste) return res.status(404).send(errMsg.POSTE_NOT_FOUND);
        }

        if (!req.body.username || !req.body.courriel) return res.status(400).send(errMsg.MISSING_CREDENTIALS);

        // Check if an employee with those credentials exists already
        var employe = await Employe.findOne({
            where:
            {
                [Op.or]:
                    [
                        {
                            username: req.body.username
                        },
                        {
                            courriel: req.body.courriel
                        }
                    ]
            }
        });
        if (employe) return res.status(409).send(errMsg.EMPLOYEE_ALREADY_EXISTS);

        var employe = await Employe.createFull(req.body);
        res.status(200).send(employe);
    } catch (err) {
        return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// GET / (READ self)
router.get('/', authenticate, asWorker, async (req, res) => {
    try {
        delete req.user.oid;
        res.status(200).send(req.user);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// GET /:id (READ for others)
router.get('/:id', checkExist, authenticate, asAdmin, checkMembership, read);

// PATCH / (UPDATE self)
router.patch('/', authenticate, asWorker, async (req, res) => {
    try {
        var params = _.pick(req.body, ['nom', 'prenom', 'telephone', 'courriel', 'tauxHoraire', 'username', 'password', 'new_password']);
        var employe;
        var old;

        try {
            old = await Employe.findByCredentials(req.user.username, params.password);
        } catch (err) {
            res.status(400).send(errMsg.INVALID_PASSWORD);
        }

        delete params.password;
        if (params.new_password)
            params.password = params.new_password;
        delete params.new_password;

        if (params.username || params.courriel) {
            employe = await Employe.findOne({
                where: {
                    [Op.and]:
                        [
                            {
                                [Op.or]:
                                    [
                                        {
                                            username: params.username
                                        },
                                        {
                                            courriel: params.courriel
                                        }
                                    ]
                            },
                            {
                                id:
                                {
                                    [Op.not]: req.user.id
                                }
                            }
                        ]
                }
            });
            if (employe) return res.status(409).send(errMsg.EMPLOYEE_ALREADY_EXISTS);

            var organisation = await Organisation.findOne({
                where: {
                    [Op.or]:
                        [
                            {
                                username: params.username
                            },
                            {
                                courriel: params.courriel
                            }
                        ]
                }
            });
            if (organisation) return res.status(409).send(errMsg.ORGANISATION_ALREADY_EXISTS);
        }
        employe = await Employe.findOneFull({ id: req.user.id });
        await employe.updateFull(params);
        res.status(200).send(employe);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

router.patch('/:id', checkExist, authenticate, asAdmin, checkMembership, async (req, res) => {
    try {
        var params = _.pick(req.body, ['nom', 'prenom', 'telephone', 'courriel', 'tauxHoraire', 'username', 'password', 'admin', 'Poste_id']);
        var employe;
        if (params.username || params.courriel) {
            employe = await Employe.findOne({
                where: {
                    [Op.and]:
                        [
                            {
                                [Op.or]:
                                    [
                                        {
                                            username: params.username
                                        },
                                        {
                                            courriel: params.courriel
                                        }
                                    ]
                            },
                            {
                                id:
                                {
                                    [Op.not]: req.instance.id
                                }
                            }
                        ]
                }
            });
            if (employe) return res.status(409).send(errMsg.EMPLOYEE_ALREADY_EXISTS);

            var organisation = await Organisation.findOne({
                where: {
                    [Op.or]:
                        [
                            {
                                username: params.username
                            },
                            {
                                courriel: params.courriel
                            }
                        ]
                }
            });
            if (organisation) return res.status(409).send(errMsg.ORGANISATION_ALREADY_EXISTS);
        }

        employe = await req.instance.updateFull(params);
        res.status(200).send(employe);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// DELETE / (DELETE self)
router.delete('/', authenticate, asManager, async (req, res) => {
    try {
        var params = _.pick(req.body, ['password']);
        if (!params.password) return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);

        try {
            await Employe.findByCredentials(req.session.user.username, params.password);
        } catch (err) {
            return res.status(401).send(errMsg.INVALID_PASSWORD);
        }

        await req.user.destroy();
        res.status(200).send(req.user);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT)
    }
});

// DELETE /:id (DELETE for others)
router.delete('/:id', checkExist, authenticate, asAdmin, checkMembership, async (req, res) => {
    try {
        await req.instance.destroy();
        res.status(200).send(req.instance);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

module.exports = router;