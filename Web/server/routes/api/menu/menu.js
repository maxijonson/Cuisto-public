var router = require('express').Router();
const _ = require('lodash');
const moment = require('moment');

var { Menu, Restaurant, Organisation } = require('./../../../models');

var { checkExist, create, read, update, del, filterRequestBodyForParent } = require('../../../middleware/utils');
var { authenticate, asAdmin, checkMembership } = require('../../../middleware/authenticate');
const errMsg = require('../../../middleware/messages');

router.get('/liste', authenticate, async (req, res) => {
    try {
        var where = { Restaurant_id: req.session.rid };

        if (req.query.q) {
            where[Op.or] = {
                nom: { [Op.like]: `%${req.query.q}%` },
                type: { [Op.like]: `%${req.query.q}%` }
            }
        }
        if (req.query.nom)
            where.nom = { [Op.like]: `%${req.query.nom}%` };
        if (req.query.type)
            where.type = { [Op.like]: `%${req.query.type}%` };

        var menus = await Menu.findAll({
            where,
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
            ],
            attributes:
            {
                exclude: ['Restaurant_id']
            }
        });

        res.status(200).send({menus});
    } catch (err) {
        console.log(err.message);
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// POST / (CREATE)
router.post('/', authenticate, asAdmin, filterRequestBodyForParent, async (req, res) => {
    try {
        if(!req.session.rid) return res.status(400).send(errMsg.SESSION_RID_NOT_FOUND);
        req.body.Restaurant_id = req.session.rid;
        var menu = await Menu.createFull(req.body);
        return res.status(200).send(menu);
    } catch(err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// GET /:id (READ)
router.get('/:id', checkExist, authenticate, checkMembership, read);
// PATCH /:id (UPDATE)
router.patch('/:id', checkExist, authenticate, asAdmin, checkMembership, update);
// DELETE /:id (DELETE)
router.delete('/:id', checkExist, authenticate, asAdmin, checkMembership, del);

///// CHILDREN
// POST /:id/item (Item - CREATE)
router.post('/:id/item', checkExist, authenticate, asAdmin, checkMembership, create);

module.exports = router;