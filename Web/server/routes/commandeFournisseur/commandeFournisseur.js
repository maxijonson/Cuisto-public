var router = require('express').Router();
const {fetch} = require('../../middleware/utils');
const axios = require('axios');
var { authenticate, asAdmin } = require('../../middleware/authenticate');

router.get('/liste', authenticate, asAdmin, async(req, res) => {
    try {
        var commandes = (await axios.get(process.env.APP_URL + '/api/commandeFournisseur/liste', {
            withCredentials: true,
            maxRedirects: 0,
            headers: {'x-auth': req.session.token, Cookie: req.cookie}
        })).data;

        
        var fournisseurs = (await axios.get(process.env.APP_URL + '/api/fournisseur/liste', {
            withCredentials: true,
            maxRedirects: 0,
            headers: {'x-auth': req.session.token, Cookie: req.cookie}
        })).data;
    
        if(commandes.err) return res.status(data.error.status).send(); 
        if(fournisseurs.err) return res.status(data.error.status).send();
        
        console.log(fournisseurs);
        res.status(200).render('partials/Fournisseur/logdescommandes.hbs', {commandes, fournisseurs})
    } catch(err) {
        res.status(400).send();
        console.log(err.message);
    }
})

router.get('/:id', authenticate, asAdmin, async(req, res) => {
    try {
        var commande = (await axios.get(process.env.APP_URL + '/api/commandeFournisseur/' + req.params.id, {
            withCredentials: true,
            maxRedirects: 0,
            headers: {'x-auth': req.session.token, Cookie: req.cookie}
        })).data;
    
        if(commande.err) return res.status(data.error.status).send(); 
        
        console.log(commande.Articles);
        res.status(200).render('partials/Commande/commande.hbs', {commande})
    } catch(err) {
        res.status(400).send();
        console.log(err.message);
    }
})




module.exports = router;