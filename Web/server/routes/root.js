var router = require('express').Router();
var { authenticate } = require('../middleware/authenticate');
const axios = require('axios');
const fs = require('fs');
const errMsg = require('../middleware/messages');
var { Employe, Organisation } = require('../models');

function getImage(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(`${__dirname}/../../public/Screenshots/${dir}`, (err, files) => {
            if(err) reject(err);
            var image = {};
            image.path = `/Screenshots/${dir}/image.png`;
            delete require.cache[require.resolve(`../../public/Screenshots/${dir}/info.json`)];
            var json = require(`../../public/Screenshots/${dir}/info.json`);
            image.title = json.title;
            image.description = json.description;

            resolve(image);
        });
    });
}

function getImages() {
    return new Promise((resolve, reject) => {
        fs.readdir(`${__dirname}/../../public/Screenshots`, async (err, dirs) => {
            if(err) reject(err);
            var images = [];

            for (var dir of dirs)
                images.push(await getImage(dir));
            resolve(images);
        });
    });
}

// GET /
router.get('/', async (req, res) => {
    try {
        var images = await getImages();

        res.status(200).render('root/home.hbs', {
            title: 'Cuisto',
            user: req.session.user,
            images
        });
    } catch (err) {
        res.status(500).send(errMsg.INTERNAL);
    }
});

router.get('/login', async (req, res) => {
    try {
        if(req.session.user) return res.redirect('panel');
        res.status(200).render('root/Login/login.hbs');
    } catch (err) {
        res.status(400).send();
    }
});

router.post('/login', async (req, res) => {
    try {
        ////// LOGIN PROCEDURE
        // POST request to the signin API enpoint
        var request = await axios.post(process.env.APP_URL + '/api/signin', req.body);

        // If signin successful, load the token into the session from the request headers (x-auth)
        // The token is what contains information on the user
        req.session.token = request.headers['x-auth'];
        if(!req.body.connection)
            req.session.cookie.maxAge = null;
        else 
            req.session.cookie.expires = new Date(process.env.COOKIE_NEVER_EXPIRE);
        // Redirect to the desired route
        res.status(200).send();
    } catch (err) {
        console.log(err);
        // Axios will throw an error if the POST request failed
        if (err.response)
            res.status(err.response.status).send(err.response.data); 
        else
            res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    }
});

// GET /panel - redirects to the right panel
router.get('/panel', authenticate, async (req, res) => {
    try {
        if(req.user.type == "organisation")
            return res.redirect('/restaurant/liste');
        if(req.user.type == "manager")
            return res.redirect('/restaurant/panel');
        if(req.user.type == "employe")
            return res.redirect('/me');

        return res.status(500).send();
    } catch (err) {
        res.status(400).send();
    }
});

router.get('/signup', async (req, res) => {
    try {
        if(req.session.user) return res.redirect('panel');
        res.status(200).render('root/Signup/signup.hbs');
    } catch (err) {
        res.status(400).send();
    }
});

router.post('/signup', async (req, res) => {
    try {
        var request = await axios.post(process.env.APP_URL + '/api/signup', req.body);
        req.session.token = request.headers['x-auth'];
        res.status(200).send();
    } catch (err) {
        if (err.response) 
            res.status(err.response.status).send(err.response.data); 
        else
            res.status(400).send();
    }
});

router.get('/logout', authenticate, async (req, res) => {
    try {
        await axios.get(process.env.APP_URL + '/api/logout', {
            headers: 
            {
                'x-auth': req.token,
                Cookie: req.cookie
            }
        });
        res.redirect('login');
    } catch (err) {
        res.status(400).send();
    }
});

router.get('/passwordReset', async (req, res) => {
    try {
        if(!req.query.token) return res.status(400).redirect('login');
        var user; 

        try {
            user = await Emplolye.findByToken(req.query.token, true);
        } catch (err) {
            user = await Organisation.findByToken(req.query.token, true);
        }

        res.status(200).render('root/forgot/forgot.hbs', {
            u: user
        });
    } catch (err) {
        res.status(400).redirect('login');
    }
});

module.exports = router;
