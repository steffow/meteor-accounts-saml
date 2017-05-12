Package.describe({
    name:"steffo:meteor-accounts-saml",
    summary: "SAML Login (SP) for Meteor. Works with OpenAM, OpenIDP and provides Single Logout.",
    version: "0.0.9",
    git: "https://github.com/steffow/meteor-accounts-saml.git"
});

Package.on_use(function (api) {
    api.versionsFrom('1.4.4.1');
    api.use(['routepolicy','webapp','underscore', 'service-configuration'], 'server');
    api.use(['http','accounts-base','random'], ['client', 'server']);

    api.add_files(['saml_server.js','saml_utils.js'], 'server');
	api.add_files('saml_client.js', 'client');
});

Package.onTest((api) => {
  // Sets up a dependency on this package.
  api.use('steffo:meteor-accounts-saml');
  // Use the Mocha test framework.
  api.use('practicalmeteor:mocha@2.4.5_2');
});

Npm.depends({
    "depd": "1.1.0",
    "bytes": "2.5.0",
    "content-type": "1.0.2",
    "debug": "2.6.3",
    "ms": "1.0.0",
    "http-errors": "1.6.1",
    "inherits": "2.0.3",
    "setprototypeof": "1.0.3",
    "statuses": "1.3.1",
    "iconv-lite": "0.4.15",
    "on-finished": "2.3.0",
    "ee-first": "1.1.1",
    "qs": "6.4.0",
    "raw-body": "2.2.0",
    "unpipe": "1.0.0",
    "type-is": "1.6.15",
    "media-typer": "0.3.0",
    "mime-types": "2.1.15",
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
