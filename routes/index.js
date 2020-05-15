const express = require('express');

const xmlRoute = require('./xml');

const router = express.Router();

module.exports = (params) => {
    const { ldapService } = params;

    router.get('/', async (request, response, next) => {
        try {
            const phoneNumbers = await ldapService.getAllPhoneNumbers();

            return response.render('layout', {
                pageTitle: 'Sedes',
                template: 'index',
                phoneNumbers,
            });
        } catch (err) {
            return next(err);
        }
    });

    router.use('/xml', xmlRoute(params));

    router.get('/:sede', async (request, response, next) => {
        try {
            const phoneNumbers = await ldapService.getSedeNumbers(request.params.sede);

            return response.render('layout', {
                pageTitle: 'Sede ' + request.params.sede,
                template: 'index',
                phoneNumbers,
            });
        } catch (err) {
            return next(err);
        }
    });

    return router;
};