const ldap = require('ldapjs');
const xmlBuilder = require('xmlbuilder');

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

            var data = {
                sedes: [],
                internos: [],
            }

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

                                            if (entryTel.object.cn == "sede"){
                                                data.sedes.push({
                                                    'nombre': entry.object.description,
                                                    'webpage': entryTel.object.description,
                                                    'caracteristica': entryTel.object.telephoneNumber,                                                    
                                                });
                                            }
                                            else{
                                                if (entryTel.object.description != "privado"){
                                                    data.internos.push({
                                                        'sede': entry.object.description,
                                                        'seccion': entryTel.object.givenName,
                                                        'interno': entryTel.object.telephoneNumber,                                                    
                                                    });
                                                }                                                
                                            }                                            
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

        var data = await this.getAllPhoneNumbers();

        var doc = xmlBuilder.create('root', { version: '1.0', encoding: 'UTF-8' },
            { pubID: null, sysID: null },
            {
                allowSurrogateChars: false, skipNullAttributes: false,
                headless: false, ignoreDecorators: false, stringify: {}
            });

        var xmlSedes = doc.ele('root_group');
        var contactos = doc.ele('root_contact');
        var sedesString = '';
        var conString = '';

        data.sedes.forEach(element => {

            xmlSedes.ele('group')
                .att('display_name', element.nombre)
                .att('ring', '')
                .up();
        });

        data.internos.forEach(item => {

            contactos.ele('contact')
                .att('display_name', item.seccion)
                .att('office_number', item.interno)
                .att('line', '0')
                .att('group_id_name', item.sede)
                .up();
        });

        sedesString = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sedesString = sedesString + xmlSedes.toString({ pretty: true });
        conString = contactos.toString({ pretty: true });

        return (sedesString + conString);
    }

    async getSedeNumbers(sedeName) {

        var data = await this.getAllPhoneNumbers();

        data.internos = data.internos.filter((entry) => {
            return entry.sede.toUpperCase() === sedeName.toUpperCase();
        });

        return data;
    }
}

module.exports = LdapService;