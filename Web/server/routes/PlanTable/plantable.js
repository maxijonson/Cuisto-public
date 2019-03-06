var router = require('express').Router();
const axios = require('axios');
var { authenticate, asAdmin } = require('../../middleware/authenticate');

// GET /tablePlan
router.get('/liste', authenticate, asAdmin, async (req, res) => {
    try {
        //Load Liste de Salles
        var salles = await axios.get(process.env.APP_URL + '/api/salle/liste?withTableData', {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        });
        
        console.log(salles.data);
        res.status(200).render('partials/PlanTable/liste.hbs',{salles:salles.data.salles});
    } catch (err) {
        console.log(err.message);
        res.status(400).send();
    }
});

router.get('/:id/tables', authenticate, asAdmin, async (req,res) => {
    try {
        var request = (await axios.get(process.env.APP_URL + '/api/salle/' + req.params.id + '/tables', {
            withCredentials: true,
            maxRedirects: 0,
            headers: {'x-auth': req.session.token, Cookie: req.cookie}
        })).data;
        res.status(200).render('partials/PlanTable/listetable.hbs',{tables: request.tables, salle: request.salle});
    }
    catch(err) {
        console.log(err);
        res.status(400).send();
    }
});

module.exports = router;