var router = require('express').Router();
const axios = require('axios');
var { authenticate, asAdmin } = require('../../middleware/authenticate');

// GET /table
router.get('/liste', authenticate, asAdmin, async (req, res) => {
    try {
        //Load Liste de Salles
        var salles = await axios.get(process.env.APP_URL + '/api/table/liste', {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        });

        //Load Liste de Tables
        var tables = await axios.get(process.env.APP_URL + '/api/table/liste', {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        });
        console.log(salles.data);
        res.status(200).render('partials/PlanTable/liste.hbs',{salles:salles.data.salles, tables:tables.data.tables,});
    } catch (err) {
        console.log(err.message);
        res.status(400).send();
    }
});

module.exports = router;