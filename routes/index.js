const express = require('express');

const xmlRoute = require('./xml');

const router = express.Router();

module.exports = (params) => {
    const { ldapService } = params;

    router.get('/', async (request, response, next) => {
        try {

            var data = {
                sedes: [],
                internos: [],
            }

            data = await ldapService.getAllPhoneNumbers();

            const sedes = data.sedes;
            const phoneNumbers = data.internos;

            return response.render('layout', {
                pageTitle: 'Sedes',
                template: 'index',
                sedes,
                phoneNumbers,
            });
        } catch (err) {
            return next(err);
        }
    });

    router.use('/xml', xmlRoute(params));

    router.get('/:sede', async (request, response, next) => {
        try {

            var data = {
                sedes: [],
                internos: [],
            }

            data = await ldapService.getSedeNumbers(request.params.sede);

            const sedes = data.sedes;
            const phoneNumbers = data.internos;

            return response.render('layout', {
                pageTitle: 'Sede ' + request.params.sede,
                template: 'index',
                sedes,
                phoneNumbers,
            });
        } catch (err) {
            return next(err);
        }
    });

    return router;
};