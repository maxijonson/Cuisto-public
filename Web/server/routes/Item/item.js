var router = require('express').Router();
const axios = require('axios');
var { authenticate, asAdmin } = require('../../middleware/authenticate');

router.get('/liste', authenticate, asAdmin, async (req, res) => {
    try {
        // Loader les variables
        var Items = (await axios.get(process.env.APP_URL + '/api/item/liste', {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        })).data;
        if(Items.error) return res.status(Menu.error.status).send();

        console.log(Items);
        res.status(200).render('partials/Item/liste.hbs', {Items});
    } catch(err) {
        console.log(err.message);   
        res.status(400).send();
    }
})

module.exports = router;