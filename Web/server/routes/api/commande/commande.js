var router = require('express').Router();
const _ = require('lodash');
const moment = require('moment');

const errMsg = require('../../../middleware/messages');
var { checkExist, create, read, update, del } = require('../../../middleware/utils');
var { authenticate, asAdmin, checkMembership } = require('../../../middleware/authenticate');
var { Commande, Employe, Table, Poste, Organisation, Restaurant, Salle, CommandeItem, Item, Menu } = require('../../../models');
const Op = require('sequelize').Op;

const ITEM_INCLUDE = [
    {
        model: Menu,
        attributes:
        {
            exclude: ['Restaurant_id']
        },
        include:
        [
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
        ]
    }
];

function genQuery(where, req) {
    return {
        where,
        include:
            [
                {
                    model: Employe,
                    where:
                    {
                        Restaurant_id: req.session.rid
                    },
                    attributes:
                    {
                        exclude: ['Restaurant_id', 'password', 'Poste_id']
                    },
                    include:
                        [
                            {
                                model: Poste,
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
                            },
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
                },
                {
                    model: Table,
                    attributes:
                    {
                        exclude: ['Salle_id']
                    },
                    include:
                        [
                            {
                                model: Salle,
                                attributes:
                                {
                                    exclude: ['Restaurant_id']
                                },
                                include:
                                    [
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
                                    ]
                            }
                        ]
                }
            ],
        attributes:
        {
            exclude: ['Employe_id', 'Table_id']
        }
    };
}

async function AddItems(commande) {
    commande.Items = [];
    var cis = await CommandeItem.findAll({
        where:
        {
            Commande_id: commande.id
        }
    });

    for (var ci of cis)
        commande.Items.push((await Item.findOne({
            where: 
            {
                id: ci.Item_id
            },
            include: ITEM_INCLUDE,
            attributes: 
            {
                exclude: ['Menu_id']
            }
        })).toJSON());
}

router.get('/liste', authenticate, async (req, res) => {
    try {
        var where = {};

        if (req.query.q) {
            where[Op.or] = {
                statut: { [Op.like]: `%${req.query.q}%` },
                Employe_id: !isNaN(req.query.q) ? req.query.q : undefined,
                Table_id: !isNaN(req.query.q) ? req.query.q : undefined,
                client: !isNaN(req.query.q) ? req.query.q : undefined
            }
        }
        if (req.query.statut)
            where.statut = { [Op.like]: `%${req.query.statut}%` };
        if (req.query.Employe_id)
            where.Employe_id = !isNaN(req.query.Employe_id) ? req.query.Employe_id : undefined;
        if (req.query.Table_id)
            where.Table_id = !isNaN(req.query.Table_id) ? req.query.Table_id : undefined;
        if (req.query.client)
            where.client = !isNaN(req.query.client) ? req.query.client : undefined;

        var commandes = await Commande.findAll(genQuery(where, req));
        var tmp = [];
        commandes.forEach(commande => {
            tmp.push(commande.toJSON());
        });
        commandes = tmp;

        for (var commande of commandes) 
            await AddItems(commande);

        res.status(200).send({ commandes });
    } catch (err) {
        console.log(err.message);
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// CREATE @ /api/table/:id/commande

// GET /:id (READ)
router.get('/:id', checkExist, authenticate, checkMembership, async (req, res) => {
    try {
        var commande = req.instance.toJSON();
        await AddItems(commande);
        res.status(200).send(commande);
    } catch(err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});
// PATCH /:id (UPDATE)
router.patch('/:id', checkExist, authenticate, checkMembership, async (req, res) => {
    try {
        req.body = _.pick(req.body, ['statut', 'items', 'client']);

        req.instance = await req.instance.update(req.body);

        if(req.body.items) {
            var items = [];

            req.body.items.forEach(item => {
                items.push({
                    Item_id: item,
                    Commande_id: req.instance.id
                });
            });
            await CommandeItem.destroy({
                where: {
                    Commande_id: req.instance.id
                }
            });
            await CommandeItem.bulkCreate(items);
        }

        var commande = (await Commande.findOne({where: {id: req.instance.id}})).toJSON();
        await AddItems(commande);
        res.status(200).send(commande);
    } catch (err) {
        console.log(err.message);
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});
// DELETE /:id (DELETE)
router.delete('/:id', checkExist, authenticate, checkMembership, async (req, res) => {
    try {
        var commande = req.instance.toJSON();
        await AddItems(commande);
        await req.instance.destroy();
        res.status(200).send(commande);
    } catch(err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

module.exports = router;