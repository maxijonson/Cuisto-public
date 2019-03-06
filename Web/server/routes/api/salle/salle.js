var router = require('express').Router();
const _ = require('lodash');

var { Salle, Table } = require('./../../../models');
var { checkExist, create, read, update, del, filterRequestBodyForParent } = require('../../../middleware/utils');
var { authenticate, asAdmin, checkMembership } = require('../../../middleware/authenticate');
const errMsg = require('../../../middleware/messages');

// QUERY - Salle
router.get('/liste', async (req, res) => {
    try {
        if(!req.session.rid) return res.status(400).send(errMsg.SESSION_RID_NOT_FOUND);
        var salles = await Salle.findAll({
            where:
            {
                Restaurant_id: req.session.rid
            },
            attributes:
            {
                exclude: ['Restaurant_id']
            }
        });

        if (req.query.hasOwnProperty("withTableData")) {
            for (var salle of salles) {
                salle.dataValues.tables = await Table.findAll({
                    where:
                    {
                        Salle_id: salle.id
                    }
                });
                var nbPlaces = 0;
                for(var table of salle.dataValues.tables) 
                    nbPlaces += table.maxPlace;
                salle.dataValues.nbPlaces = nbPlaces;
            }
        }

        res.status(200).send({salles});
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// QUERY - Salle
router.get('/:id/tables', checkExist, authenticate, checkMembership, async (req, res) => {
    try {
        var tables = await Table.findAll({
            where: 
            {
                Salle_id: req.instance.id
            },
            attributes: 
            {
                exclude: ['Salle_id']
            }
        });

        res.status(200).send({tables, salle: req.instance});
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// POST / (CREATE)
router.post('/', authenticate, asAdmin, filterRequestBodyForParent, async (req, res) => {
    try {
        if(!req.session.rid) return res.status(400).send(errMsg.SESSION_RID_NOT_FOUND);
        req.body.Restaurant_id = req.session.rid;
        var salle = await Salle.createFull(req.body);
        return res.status(200).send(salle);
    } catch(err) {
        console.log(err.message);
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// GET /:id (READ)
router.get('/:id', checkExist, authenticate, checkMembership, read);

// PATCH /:id (UPDATE)
router.patch('/:id', checkExist, authenticate, asAdmin, checkMembership, update);

// DELETE /:id (DELETE)
router.delete('/:id', checkExist, authenticate, asAdmin, checkMembership,  del);

// POST /:id/table (Table - CREATE)
router.post('/:id/table', checkExist, authenticate, asAdmin, checkMembership, create);

module.exports = router;