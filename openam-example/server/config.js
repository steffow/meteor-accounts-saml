Meteor.startup(function () {
    var initialBoot = false;
    //
    var adminUserA = Meteor.users.findOne({
        "emails.address": "ida.zimt@gmail.com"
    });
    
    var adminUserB = Meteor.users.findOne({
        "emails.address": "steffo.weber@gmail.com"
    });
    if (initialBoot && !(adminUserA)) {
        console.log("Will create new root user A - ENABLED. Please change code in config.js, Line 7");
        Accounts.createUser({
            email: "ida.zimt@gmail.com",
            password: "password",
            username: "Ida Zimt",
            profile: ""
        });
        adminUserA = Meteor.users.findOne({
            "emails.address": "ida.zimt@gmail.comm"
        });
    }
    
        if (initialBoot && !(adminUserB)) {
        console.log("Will create new root user B - ENABLED. Please change code in config.js, Line 7");
        Accounts.createUser({
            email: "steffo.weber@gmail.com",
            password: "password",
            username: "Steffo (Feide Test Account)",
            profile: ""
        });
        adminUserB = Meteor.users.findOne({
            "emails.address": "steffo.weber@gmail.com"
        });
    }

    for (i = 0; i < Meteor.settings.saml.length; i++) {
        // privateCert is weird name, I know.
        if (Meteor.settings.saml[i].privateKeyFile && Meteor.settings.saml[i].publicCertFile) {
            console.log("Set keys/certs for " + Meteor.settings.saml[i].provider);
            Meteor.settings.saml[i].privateCert = Assets.getText(Meteor.settings.saml[i].publicCertFile);
            Meteor.settings.saml[i].privateKey = Assets.getText(Meteor.settings.saml[i].privateKeyFile);
        } else {
            console.log("No keys/certs found for " + Meteor.settings.saml[i].provider);
        }
    }

});