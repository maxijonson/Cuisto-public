var router = require('express').Router();
const _ = require('lodash');
const moment = require('moment');

var { Facture } = require('../../../models');
var { checkExist, create, read, update, del, filterRequestBodyForParent } = require('../../../middleware/utils');
var { authenticate, asAdmin, checkMembership } = require('../../../middleware/authenticate');
const errMsg = require('../../../middleware/messages');

// POST / (CREATE)
router.post('/', authenticate, filterRequestBodyForParent, async (req, res) => {
    try {
        if(!req.session.rid) return res.status(400).send(errMsg.SESSION_RID_NOT_FOUND);
        req.body.Restaurant_id = req.session.rid;
        var facture = await Facture.createFull(req.body);
        return res.status(200).send(facture);
    } catch(err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// GET /:id (READ)
router.get('/:id', checkExist, authenticate, checkMembership, read);
// PATCH /:id (UPDATE)
router.patch('/:id', checkExist, authenticate, checkMembership, update);
// DELETE /:id (DELETE)
router.delete('/:id', checkExist, authenticate, checkMembership, del);

module.exports = router;