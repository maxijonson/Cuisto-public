var router = require('express').Router();
const _ = require('lodash');
const { Op } = require('sequelize');

var { Restaurant, Organisation, Poste, Employe } = require('./../../../models');
var { checkExist, create, createOrganisation, filterRequestBodyForChildren } = require('../../../middleware/utils');
var { authenticate, asOrganisation } = require('../../../middleware/authenticate');
const errMsg = require('../../../middleware/messages');

// GET / (READ)
router.get('/', authenticate, asOrganisation, async (req, res) => {
    try {
        res.status(200).send(req.user);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// PATCH /:id (UPDATE)
router.patch('/', authenticate, asOrganisation, async (req, res) => {
    try {
        var params = _.pick(req.body, ['nom', 'courriel', 'username', 'password', 'new_password']);
        var organisation;
        var old;
        try {
        old = await Organisation.findByCredentials(req.user.username, params.password);
        } catch (err) {
            res.status(400).send(errMsg.INVALID_PASSWORD);
        }

        delete params.password;
        if(params.new_password)
            params.password = params.new_password;
        delete params.new_password;

        if (!params) return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
        if (params.username || params.courriel) {
            organisation = await Organisation.findOne({
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
            if (organisation) return res.status(409).send(errMsg.ORGANISATION_ALREADY_EXISTS);

            var employe = await Employe.findOne({
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
            if (employe) return res.status(409).send(errMsg.EMPLOYEE_ALREADY_EXISTS);
        }
        organisation = await Organisation.findOneFull({ id: req.user.id });
        await organisation.updateFull(params);
        res.status(200).send(organisation);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// DELETE /:id (DELETE)
router.delete('/', authenticate, asOrganisation, async (req, res) => {
    try {
        var params = _.pick(req.body, ['password']);
        if(!params.password) return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);

        try {
            await Organisation.findByCredentials(req.session.user.username, params.password);
        } catch(err) {
            return res.status(401).send(errMsg.INVALID_PASSWORD);
        }

        await req.user.destroy();
        res.status(200).send(req.user);
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

module.exports = router;