var router = require('express').Router();
const axios = require('axios');
var { checkExist } = require('../../middleware/utils');
var { authenticate, asOrganisation, asAdmin, checkMembership } = require('../../middleware/authenticate');
var cookieParser = require('cookie-parser');

router.get('/liste', authenticate, asOrganisation, async (req, res) => {
    try {
        var data = await axios.get(process.env.APP_URL + '/api/restaurant/liste', {
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        });    
        if(data.error) return res.status(data.error.status).send();
        res.status(200).render('root/Restaurant/list.hbs', {restaurants: data.data.restaurants, user: req.session.user});
    } catch (err) {
        res.status(400).send();
    }
});

router.get('/panel', authenticate, asAdmin, async (req, res) => {
    try {
        var restaurant = (await axios.get(process.env.APP_URL + '/api/restaurant/' + req.session.rid, {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        })).data;
        var title = `${restaurant.nom}`;
        console.log(req.session.user);
        res.status(200).render('root/Restaurant/panel.hbs', {title, user: req.session.user});
    } catch (err) {
        res.status(400).send();
    }
});

router.get('/create', authenticate, asAdmin, async (req, res) => {
    try {
        res.status(200).render('root/Restaurant/create.hbs');
    } catch (err) {
        res.status(400).send();
    }
});

router.post('/create', authenticate, asAdmin, async(req, res) => {
    try {
        var request = await axios.post(process.env.APP_URL + '/api/restaurant', req.body, {
            withCredentials: true,
            maxRedirects: 0,
            headers: { 'x-auth': req.session.token, Cookie: req.cookie }
        });
        res.redirect('/restaurant/liste');
    } catch (err) {
        if (err.response) {
            if(err.response.data.message)
                res.status(err.response.status).redirect('/restaurant/liste?error='+err.response.data.message);
            else
                res.status(err.response.status).redirect('/restaurant/liste?error=1');
        } 
        else
            res.status(400).send();
    }
})

router.get('/:id', checkExist, authenticate, asOrganisation, checkMembership, async (req, res) => {
    try {
        req.rid = req.session.rid = req.instance.id;
        res.redirect('panel');
    } catch (err) {
        res.status(400).send();
    }
});

module.exports = router;