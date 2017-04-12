Package.describe({
    name:"steffo:meteor-accounts-saml",
    summary: "SAML Login (SP) for Meteor. Works with OpenAM, OpenIDP and provides Single Logout.",
    version: "0.0.2",
    git: "https://github.com/steffow/meteor-accounts-saml.git"
});

Package.on_use(function (api) {
    api.versionsFrom('1.1.0.2');
    api.use(['routepolicy','webapp','underscore', 'service-configuration'], 'server');
    api.use(['http','accounts-base','random'], ['client', 'server']);

    api.add_files(['saml_server.js','saml_utils.js'], 'server');
	api.add_files('saml_client.js', 'client');
});

Npm.depends({
    "xml2js": "0.4.17",
    "body-parser": "1.17.1",
    "sax": "1.2.2",
    "xmlbuilder": "8.2.2",
    "ejs": "2.5.6",
    "async": "2.3.0",
    "lodash":"4.17.4",
    "xpath": "0.0.24",
    "node-forge": "0.7.1",
    "xpath.js": "1.0.7",
    "xmldom": "0.1.27",
    "connect": "3.6.0",
    "querystring": "0.2.0",
    "xml-encryption": "0.10.0",
    "xml-crypto": "0.9.0"
});
