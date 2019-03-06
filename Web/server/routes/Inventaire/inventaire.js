var router = require('express').Router();
const axios = require('axios');
var { authenticate, asAdmin } = require('../../middleware/authenticate');

router.get('/liste', authenticate, asAdmin, async (req, res) => {
    try {
        // Loader les variables
        var data = await axios.get(process.env.APP_URL + '/api/article/liste', {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        });

        var fournisseurs = (await axios.get(process.env.APP_URL + '/api/fournisseur/liste', {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie}
        })).data;

        if(data.error) return res.status(data.error.status).send();
        
        console.log(data);
        console.log(fournisseurs);
        res.status(200).render('partials/Inventaire/liste.hbs', {data:data.data , fournisseurs : fournisseurs.fournisseurs});
    } catch(err) {
        res.status(400).send();
    }
})

router.get('/modifyInventaire', authenticate, asAdmin, async (req, res) => {
    try{
        var Articles = await axios.get(process.env.APP_URL + '/api/article/liste', {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        });
        res.status(200).render('partials/Inventaire/modifyInventaire.hbs', {data:Articles.data});
    } catch(err){
        res.status(400).send();
    }
})



module.exports = router;