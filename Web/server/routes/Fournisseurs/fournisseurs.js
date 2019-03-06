var router = require('express').Router();
const {fetch} = require('../../middleware/utils');
const axios = require('axios');
var { authenticate, asAdmin } = require('../../middleware/authenticate');

router.get('/liste', authenticate, asAdmin, async (req, res) => {
    try {
        // Loader les variables
        var data = await axios.get(process.env.APP_URL + '/api/fournisseur/liste', {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        });
        if(data.error) return res.status(data.error.status).send();
        
        res.status(200).render('partials/Fournisseur/liste.hbs', {data:data.data});
    } catch(err) {
        res.status(400).send();
    }
})

router.get('/:id', authenticate, asAdmin, async (req, res) => {
    try {
        var fournisseur = (await axios.get(process.env.APP_URL + '/api/fournisseur/' + req.params.id, {
            withCredentials: true,
            maxRedirects: 0,
            headers: {'x-auth': req.session.token, Cookie: req.cookie}
        })).data;

        if(fournisseur.err) return res.status(data.error.status).send();

        console.log(fournisseur);

        res.status(200).render('partials/Fournisseur/listearticle.hbs', {fournisseur} )

    } catch(err) {
        res.status(400).send();
        console.log(err.message);
    }
})

router.get('/commander/:id', authenticate, asAdmin, async(req, res) => {
    try {
        var fournisseur = (await axios.get(process.env.APP_URL + '/api/fournisseur/' + req.params.id, {
            withCredentials: true,
            maxRedirects: 0,
            headers: {'x-auth': req.session.token, Cookie: req.cookie}
        })).data;

        if(fournisseur.err) return res.status(data.error.status).send();

        console.log(fournisseur);

        res.status(200).render('partials/Fournisseur/commande.hbs', {fournisseur} )

    } catch(err) {
        res.status(400).send();
        console.log(err.message);
    }
})

module.exports = router;