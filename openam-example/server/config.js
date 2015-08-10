Meteor.startup(function () {
    var initialBoot = true;
    // Change Fred Fredsen for your Google/OpenAM user

    
    var user = Meteor.users.findOne({
        "emails.address": "fred.fredsen@gmail.com"
    });
    if (initialBoot && !(user)) {
        console.log("Will create new root user - ENABLED. Please change code in config.js, Line 7");
        Accounts.createUser({
            email: "fred.fredsen@gmail.com",
            password: "password",
            username: "Fred Fredsen",
            profile: ""
        });
        adminUser = Meteor.users.findOne({
            "emails.address": "fred.fredsen@gmail.com"
        });
    }
    

    for (i = 0; i < Meteor.settings.saml.length; i++) {
        // privateCert is weird name, I know. spCert is better one. Will need to refactor
        if (Meteor.settings.saml[i].privateKeyFile && Meteor.settings.saml[i].publicCertFile) {
            console.log("Set keys/certs for " + Meteor.settings.saml[i].provider);
            Meteor.settings.saml[i].privateCert = Assets.getText(Meteor.settings.saml[i].publicCertFile);
            Meteor.settings.saml[i].privateKey = Assets.getText(Meteor.settings.saml[i].privateKeyFile);
        } else {
            console.log("No keys/certs found for " + Meteor.settings.saml[i].provider);
        }
    }

});