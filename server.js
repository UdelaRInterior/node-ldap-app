const express = require('express');
const config = require('./config')
const path = require('path');
const bodyParser = require('body-parser');
const createError = require('http-errors');

const LdapService = require('./services/LdapService');
const ldapService = new LdapService(config.host, config.port, config.bindDn, config.passwd, config.baseDn);

const app = express();

const routes = require('./routes');

const port = config.serverPort;

//trusted IPs
app.set('trust proxy', '127.0.0.1');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//set template engine and views dir
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.locals.siteName = `${config.siteName}`;

app.use(express.static(path.join(__dirname, './static')));

app.use(async (request, response, next) => {
    try {
        return next();
    } catch (err) {
        return next(err);
    }
});

app.use(
    '/',
    routes({
        ldapService,
    })
)

app.use((request, response, next) => {
    return next(createError(404, 'File not found'));
});

app.use((err, request, response, next) => {

    console.log(err);
    response.locals.message = err.message;
    const status = err.status || 500;
    response.locals.status = status;
    response.status(status);
    response.render('error');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})


