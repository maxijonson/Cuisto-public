var router = require('express').Router();
const _ = require('lodash');
const moment = require('moment');
const Op = require('sequelize').Op;

const errMsg = require('../../../middleware/messages');
var { Item, Menu, Restaurant, Organisation } = require('../../../models');
var { checkExist, create, read, update, del } = require('../../../middleware/utils');
var { authenticate, asAdmin, checkMembership } = require('../../../middleware/authenticate');

router.get('/liste', authenticate, async (req, res) => {
    try {
        var where = {  };

        if (req.query.q) {
            where[Op.or] = {
                nom: { [Op.like]: `%${req.query.q}%` },
                prix: !isNaN(req.query.q) ? req.query.q : undefined,
                description: { [Op.like]: `%${req.query.q}%` },
                typeItem: { [Op.like]: `%${req.query.q}%` },
                Menu_id: !isNaN(req.query.q) ? req.query.q : undefined
            }
        }
        if (req.query.nom)
            where.nom = { [Op.like]: `%${req.query.nom}%` };
        if (req.query.prix)
            where.prix = !isNaN(req.query.prix) ? req.query.prix : undefined;
        if (req.query.description)
            where.description = { [Op.like]: `%${req.query.description}%` };
        if (req.query.typeItem)
            where.typeItem = { [Op.like]: `%${req.query.typeItem}%` };
        if(req.query.Menu_id)
            where.Menu_id = !isNaN(req.query.Menu_id) ? req.query.Menu_id : undefined;

        var items = await Item.findAll({
            where,
            include:
            [
                {
                    model: Menu,
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
                exclude: ['Menu_id']
            }
        });

        res.status(200).send({items});
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

router.get('/types', authenticate, async (req, res) => {
    try {
        var items = await Item.findAll({
            include: 
            [
                {
                    model: Menu,
                    attributes: {
                        exclude: ['Menu_id']
                    },
                    where: 
                    {
                        Restaurant_id: req.session.rid
                    }
                }
            ]
        });
        var types = [];

        items.forEach(item => {
            if (types.indexOf(item.typeItem) == -1)
                types.push(item.typeItem);
        });

        res.status(200).send({ types });
    } catch (err) {
        console.log(err);
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

router.post('/', authenticate, asAdmin, async (req, res) => {
    try {
        var params = _.pick(req.body, ['nom', 'prix', 'description', 'typeItem']);
        params.Menu_id = (await Menu.findOne({
            where: 
            {
                Restaurant_id: req.session.rid
            }
        })).id;

        var item = await Item.createFull(params);
        res.status(200).send(item);
    } catch(err) {
        console.log(err.message);
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});
// CREATE @ /api/menu/:id/item

// GET /:id (READ)
router.get('/:id', checkExist, authenticate, checkMembership, read);
// PATCH /:id (UPDATE)
router.patch('/:id', checkExist, authenticate, asAdmin, checkMembership, update);
// DELETE /:id (DELETE)
router.delete('/:id', checkExist, authenticate, asAdmin, checkMembership, del);

module.exports = router;