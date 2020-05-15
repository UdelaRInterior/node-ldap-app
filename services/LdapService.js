const ldap = require('ldapjs');

class LdapService {

    constructor(host, port, bindDn, passwd, baseDn) {

        this.port = port;
        this.host = host;
        this.bindDn = bindDn;
        this.passwd = passwd;
        this.basedn = baseDn;
    }

    async getAllPhoneNumbers() {

        return new Promise((resolve, reject) => {

            var data = [];

            var client = ldap.createClient({ url: this.host + ':' + this.port });

            var sedes = 0;
            var sedesTerminadas = 0;

            client.bind(this.bindDn, this.passwd, (err) => {

                if (!err) {

                    client.search(this.basedn, { filter: '(objectclass=groupOfNames)', scope: 'one' },
                        (err, res) => {

                            res.on('searchEntry', (entry) => {
                                sedes += 1;

                                client.search(entry.object.dn, { filter: '(objectclass=inetOrgPerson)', scope: 'sub' },
                                    (errTel, resTel) => {

                                        resTel.on('searchEntry', (entryTel) => {
                                            data.push({
                                                'sede': entry.object.description,
                                                'seccion': entryTel.object.givenName,
                                                'interno': entryTel.object.telephoneNumber,
                                            });
                                        });

                                        resTel.on('end', (result) => {

                                            sedesTerminadas += 1;

                                            if (sedes == sedesTerminadas) {
                                                resolve(data);
                                            }
                                        });
                                    });
                            });
                        });

                } else {
                    reject("Can't establish connection with Ldap server");
                }
            });
        });
    }

    async getXMLPhones() {

        var phoneNumbers = await this.getAllPhoneNumbers()

        var xmlFile = '<?xml version="1.0" encoding="UTF-8"?><telefonos>';

        phoneNumbers.forEach(t => {
            xmlFile += `<telefono><sede>${t.sede}</sede><seccion>${t.seccion}</seccion><interno>${t.interno}</interno></telefono>`;
        });


        return xmlFile += '</telefonos>';
    }

    async getSedeNumbers(sedeName) {

        var phoneNumbers = await this.getAllPhoneNumbers();
        var sedeNumbers = [];

        phoneNumbers.forEach(t => {
            if (t.sede.toUpperCase() == sedeName.toUpperCase())
                sedeNumbers.push(t);
        });

        return sedeNumbers
    }
}

module.exports = LdapService;