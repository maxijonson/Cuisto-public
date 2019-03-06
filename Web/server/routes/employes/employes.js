var router = require('express').Router();
const axios = require('axios');
var { checkExist } = require('../../middleware/utils');
var { authenticate, asOrganisation, asAdmin, checkMembership } = require('../../middleware/authenticate');

router.get('/liste', authenticate, asAdmin, async (req, res) => {
    try {
        var employes = (await axios.get(process.env.APP_URL + '/api/employe/liste', {
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        })).data.employes;
        var postes = (await axios.get(process.env.APP_URL + '/api/poste/liste', {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        })).data.postes;

        if(req.session.user.type != "organisation")
            employes = employes.filter(employe => employe.id != req.session.user.id);

        res.status(200).render('partials/Employe/liste.hbs', {employes, postes});
    } catch (err) {
        res.status(400).send();
    }
})

router.get('/modifier', async (req, res) => {
    try {
        if(!req.query.id) return res.status(400).send();
        var employe = await axios.get(process.env.APP_URL + '/api/employe/' + req.query.id, {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        });
        var postes = await axios.get(process.env.APP_URL + '/api/poste/liste', {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        });
        res.status(200).render('partials/Employe/modify.hbs', {employe: employe.data, postes: postes.data});
    } catch (err) {
        res.status(400).send();
    }
})

module.exports = router;