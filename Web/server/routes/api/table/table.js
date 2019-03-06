var router = require('express').Router();
const _ = require('lodash');

const errMsg = require('../../../middleware/messages');
var { Commande, Table, Salle, CommandeItem } = require('./../../../models');
var { checkExist, create, read, update, del, filterRequestBodyForChildren } = require('../../../middleware/utils');
var { authenticate, asAdmin, checkMembership, asWorker } = require('../../../middleware/authenticate');

router.get('/liste', authenticate, async (req, res) => {
    try {
        if(!req.session.rid) return res.status(400).send(errMsg.SESSION_RID_NOT_FOUND);
        var where = {};

        var tables = await Table.findAll({
            where,
            include:
            [
                {
                    model: Salle,
                    attributes:
                    {
                        exclude: ['Restaurant_id']
                    },
                    where: 
                    {
                        Restaurant_id: req.session.rid
                    }
                }
            ],
            attributes:
            {
                exclude: ['Salle_id']
            }
        })

        res.status(200).send({tables});
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
})

// CREATE @ /api/salle/:id/table

// GET /:id (READ)
router.get('/:id', checkExist, authenticate, checkMembership, read);

// PATCH /:id (UPDATE)
router.patch('/:id', checkExist, authenticate, asAdmin, checkMembership, update);

// DELETE /:id (DELETE)
router.delete('/:id', checkExist, authenticate, asAdmin, checkMembership, del);

// POST /:id/commande (Commande - CREATE)
router.post('/:id/commande', checkExist, authenticate, asWorker, checkMembership, async (req, res) => {
    try {

        if(!req.session.user) res.status(404).send(errMsg.SESSION_USER_NOT_FOUND);
        req.body = _.pick(req.body, ['statut', 'items', 'client']);
        req.body.Table_id = req.params.id;
        req.body.Employe_id = req.session.user.id;

        var commande = await Commande.createFull(_.pick(req.body, ['Employe_id', 'statut', 'Table_id', 'client']));

        if(req.body.items) {
            var items = [];

            req.body.items.forEach(item => {
                items.push({
                    Item_id: item,
                    Commande_id: commande.id
                });
            });
            await CommandeItem.bulkCreate(items);
        }

        res.status(200).send(commande);
    } catch(err) {
        console.log(err.message);
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

module.exports = router;