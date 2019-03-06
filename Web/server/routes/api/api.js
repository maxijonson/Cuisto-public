var router = require('express').Router();
const _ = require('lodash');
var { env } = require('../../config/config');
var { authenticate } = require('../../middleware/authenticate');
var { Organisation, Employe } = require('../../models');
const errMsg = require('../../middleware/messages');
var db = require('../../models');
var Op = require('sequelize').Op;
var nodemailer = require('nodemailer');
var axios = require('axios');
var jwt = require('jsonwebtoken');

router.use('/organisation', require('./organisation/organisation'));
router.use('/restaurant', require('./restaurant/restaurant'));
router.use('/salle', require('./salle/salle'));
router.use('/table', require('./table/table'));
router.use('/poste', require('./poste/poste'));
router.use('/article', require('./article/article'));
router.use('/employe', require('./employe/employe'));
router.use('/fournisseur', require('./fournisseur/fournisseur'));
router.use('/menu', require('./menu/menu'));
router.use('/item', require('./item/item'));
router.use('/commande', require('./commande/commande'));
router.use('/reservation', require('./reservation/reservation'));
router.use('/facture', require('./facture/facture'));
router.use('/commandeFournisseur', require('./commandeFournisseur/commandeFournisseur'));

// GET /info
router.get('/info', async (req, res) => {
  res.status(200).send({
    Project: 'Cuisto',
    Authors: ['Tristan Chin', 'Marco Grande', 'Félix Gravel', 'Mederic Rochon'],
    Environnement: env
  });
});

// POST /signup
router.post('/signup', async (req, res) => {
  try {
    var params = _.pick(req.body, ['nom', 'username', 'password', 'courriel']);
    if (!params.username || !params.courriel) return res.status(400).send(errMsg.MISSING_CREDENTIALS);

    var organisation = await db.Organisation.findOne({
      where: {
        [Op.or]:
          [
            {
              username: params.username
            },
            {
              courriel: params.courriel
            }
          ]
      }
    });
    if (organisation) return res.status(409).send(errMsg.ORGANISATION_ALREADY_EXISTS);

    var employe = await Employe.findOne({
      where: {
        [Op.or]:
          [
            {
              username: params.username
            },
            {
              courriel: params.courriel
            }
          ]
      }
    });
    if (employe) return res.status(409).send(errMsg.EMPLOYEE_ALREADY_EXISTS);

    var organisation = await db.Organisation.createFull(params);
    token = await organisation.generateAuthToken();
    res.header('x-auth', token).send(organisation)
  } catch (err) {
    if(err.SequelizeDatabaseError)
      return res.status(500).send(errMsg.DATABASE_FULL);
    return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
  }
});

// POST /signin
router.post('/signin', async (req, res) => {
  try {
    var params = _.pick(req.body, ['username', 'password']);
    if (!params.username || !params.password) return res.status(400).send(errMsg.MISSING_CREDENTIALS);
    var entity;
    try {
      entity = await Employe.findByCredentials(params.username, params.password);
    } catch (err) {
      try {
      entity = await Organisation.findByCredentials(params.username, params.password);
      } catch(err) {
        return res.status(401).send(errMsg.INVALID_CREDENTIALS);
      }
    }
    token = await entity.generateAuthToken();
    res.header('x-auth', token).send(entity);
  } catch (err) {
    if(err.SequelizeDatabaseError)
      return res.status(500).send(errMsg.DATABASE_FULL);
    res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
  }
});

// POST /forgot
router.post('/forgot', async (req, res) => {
  try {
    var username = req.body.username;
    if(!username) return res.status(400).send(errMsg.MISSING_CREDENTIALS);
    
    var entity;
    var token;
    var type;

    entity = await Employe.findByUsername(username);
    if(!entity)
      entity = await Organisation.findByUsername(username);
    if(!entity) return res.status(200).send();

    token = await entity.generateForgetToken();
    var html = (await axios.get(process.env.APP_URL + `/api/forgotEmail?username=${entity.username}&token=${token}`)).data;
    
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });
    
    var mailOptions = {
      from: `Cuisto <${process.env.EMAIL}>`,
      to: entity.courriel,
      subject: 'Réinitialisation du mot de passe',
      html
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        if(error.responseCode == 534)
          console.log(`GMail blocking your device. You need to log in to GMail and authorize it!`);
        else
          console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(200).send();
  } catch(err) {
    if(err.SequelizeDatabaseError)
      return res.status(500).send(errMsg.DATABASE_FULL);
    res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
  }
});

// GET /forgotEmail
router.get('/forgotEmail', async (req, res) => {
  try {
    var params = _.pick(req.query, ['username', 'token']);
    if(!params.username || !params.token) return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    res.status(200).render('root/forgot/forgotEmail.hbs', {
      username: params.username,
      url: process.env.APP_URL,
      token: params.token
    });
  } catch (err) {
    res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
  }
});

router.post('/passwordReset', async (req, res) => {
  try {
    var params = _.pick(req.body, ['password', 'token']);
    if(!params.password || !params.token) return res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
    var user; 

    try {
        user = await Emplolye.findByToken(params.token, true);
    } catch (err) {
        user = await Organisation.findByToken(params.token, true);
    }

    await user.update({
      password: params.password
    });
    await user.removeToken(params.token);
    res.status(200).send(user);
  } catch (err) {
    if(err.SequelizeDatabaseError)
      return res.status(500).send(errMsg.DATABASE_FULL);
    res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
  }
});

// GET /logout
router.get('/logout', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    req.session.destroy(() => {
      if (process.env.CUISTO_ENV != "mocha-test")
        console.log('Session Logged Out');
      res.status(200).send();
    });
  } catch (err) {
    if(err.SequelizeDatabaseError)
      return res.status(500).send(errMsg.DATABASE_FULL);
    res.status(400).send(errMsg.BAD_REQUEST_DEFAULT);
  }
});

module.exports = router;