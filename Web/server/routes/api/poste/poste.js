var router = require('express').Router();
const _ = require('lodash');

var { Poste, Employe } = require('./../../../models');
var { checkExist, read, update, del, filterRequestBodyForParent } = require('../../../middleware/utils');
var { authenticate, asOrganisation, checkMembership } = require('../../../middleware/authenticate');
// CREATE @ /api/restaurant/:id/poste

router.get('/liste', authenticate, async (req, res) => {
    try {
        var postes = await Poste.findAll({
            where:
            {
                Organisation_id: req.session.oid
            },
            attributes: {
                exclude: ['Organisation_id']
            }
        });

        if (req.query.hasOwnProperty("withNbEmployes")) {
            for (var poste of postes) {
                poste.dataValues.nbEmployes = await Employe.count({
                    where:
                    {
                        Poste_id: poste.id
                    }
                });
            }
        }

        res.status(200).send({ postes });
    } catch (err) {
        res.status(400).send();
    }
});

router.post('/', authenticate, asOrganisation, filterRequestBodyForParent, async (req, res) => {
    try {
        req.body.Organisation_id = req.user.id;
        var poste = await Poste.createFull(req.body);
        res.status(200).send(poste);
    } catch (err) {
        res.status(400).send();
    }
});

// GET /:id (READ)
router.get('/:id', checkExist, authenticate, checkMembership, read);

// PATCH /:id (UPDATE)
router.patch('/:id', checkExist, authenticate, asOrganisation, checkMembership, update);

// DELETE /:id (DELETE)
router.delete('/:id', checkExist, authenticate, asOrganisation, checkMembership, del);

module.exports = router;