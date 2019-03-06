const express = require('express'),
    path = require('path'),
    hbs = require('express-handlebars'),
    axios = require('axios');

var { env } = require('./config/config');
var { authenticate } = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

//// KEEP ALIVE (Ping itself every 15 mins to prevent Heroku app from falling asleep)
setInterval(() => { axios.get(process.env.APP_URL) }, 15 * 60 * 1000);

//// HBS SETUP
app.engine('hbs', hbs({
    extname: 'hbs',
    partialsDir: [
        path.join(__dirname, '../views/partials')
    ],
    helpers: require('./helper').helpers
}));
app.set('view engine', 'hbs');


//// MIDDLEWARE SETUP

require('./middleware/middleware')(app);


//// START SERVER

app.listen(port, () => {
    console.log('Express server listening on port', port, '\n');
});


//// EXPORT

module.exports = { app };