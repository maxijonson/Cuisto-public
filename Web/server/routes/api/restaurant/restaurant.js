// Those three lines will always be in every API routing files
var router = require('express').Router();
const _ = require('lodash');
const moment = require('moment');
const { Op } = require('sequelize');
// This is the model that will be used. Note more models could be imported e.g.: var { Restaurant, Salle } = require('./../../../models');
var { Restaurant, Menu } = require('./../../../models'); // Relative path from this file to the FOLDER 'models' (the reason we're loading a folder and not a .js file as always is because the folder has the index.js file which is default)
// Utils for CRUD operations
var { checkExist, create, read, update, del, filterRequestBodyForChildren, filterRequestBodyForParent } = require('../../../middleware/utils');
var { authenticate, asOrganisation, checkMembership, asAdmin } = require('../../../middleware/authenticate');

// GET /liste - returns all restaurants from an organisation
router.get('/liste', authenticate, asOrganisation, async (req, res) => {
    try{
        var restaurants = await Restaurant.findAll({
            where:
            {
                Organisation_id: req.session.oid
            }
        });
        res.status(200).send({
            restaurants
        });
    } catch (err) {
        res.status(400).send();
    }
  });

///// CRUD
router.post('/', authenticate, asOrganisation, filterRequestBodyForParent, async (req, res) => {
    try {
        req.body.Organisation_id = req.user.id;
        var restaurant = await Restaurant.createFull(req.body);

        var menu = await Menu.create({
            nom: 'Menu Principal',
            Restaurant_id: restaurant.id
        });

        res.status(200).send(restaurant);
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

// Export the router (will be used when other files require this one)
module.exports = router;