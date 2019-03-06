var router = require('express').Router();
const axios = require('axios');
var { authenticate, asOrganisation, asAdmin, checkMembership } = require('../../middleware/authenticate');
const errMsg = require('../../middleware/messages');

router.get('/', authenticate, async (req, res) => {
    try {
        var title = `Compte - ${req.session.user.type == "organisation" ? req.session.user.nom : (req.session.user.prenom + " " + req.session.user.nom)}`;
        switch(req.session.user.type) {
            case "organisation":
            res.render('root/me/organisation.hbs', {user: req.session.user, title});
            break;

            case "manager":
            case "employe":
            var postes = (await axios.get(process.env.APP_URL + '/api/poste/liste', {
                withCredentials: true,
                maxRedirects: 0,
                headers: { 'x-auth': req.session.token, Cookie: req.cookie }
            })).data.postes;

            res.render('root/me/employe.hbs', {user: req.session.user, title, postes});
            break;
        }
            
    } catch (err) {
        res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

module.exports = router;