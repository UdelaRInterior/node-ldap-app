const express = require('express');

const router = express.Router();

module.exports = (params) => {
    const { ldapService } = params;

    router.get('/', async (request, response) => {

        const xmlFile = await ldapService.getXMLPhones();

        response.type('Content-Type', 'text/xml');
        response.send(xmlFile);
    });

    return router;
};