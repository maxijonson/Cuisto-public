var router = require('express').Router();
const axios = require('axios');
var { checkExist } = require('../../middleware/utils');
var { authenticate, asOrganisation, asAdmin, checkMembership } = require('../../middleware/authenticate');
const errMsg = require('../../middleware/messages');

router.get('/liste', authenticate, asOrganisation, async (req, res) => {
    try {
        var data = await axios.get(process.env.APP_URL + '/api/poste/liste?withNbEmployes', {
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        });    
        if(data.error) return res.status(data.error.status).send();
        res.status(200).render('root/Poste/list.hbs', {postes: data.data.postes, user: req.session.user});
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

router.get('/create', authenticate, asOrganisation, async (req, res) => {
    try {
        res.status(200).render('root/Poste/create.hbs', {user: req.session.user});
    } catch(err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

module.exports = router;