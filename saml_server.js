if (!Accounts.saml) {
    Accounts.saml = {};
}

var Fiber = Npm.require('fibers');
var connect = Npm.require('connect');
RoutePolicy.declare('/_saml/', 'network');

Meteor.methods({
  samlLogout: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    } else {
        console.log("Logout request from " + JSON.stringify(Meteor.userId()));   
    }
  }
})

Accounts.registerLoginHandler(function (loginRequest) {
    if (!loginRequest.saml || !loginRequest.credentialToken) {
        return undefined;
    }
    var loginResult = Accounts.saml.retrieveCredential(loginRequest.credentialToken);
    console.log("RESULT :" + JSON.stringify(loginResult));
    if (loginResult && loginResult.profile && loginResult.profile.email) {
        var user = Meteor.users.findOne({
            'emails.address': loginResult.profile.email
        });

        if (!user)
            throw new Error("Could not find an existing user with supplied email " + loginResult.profile.email);


        //creating the token and adding to the user
        var stampedToken = Accounts._generateStampedLoginToken();
        Meteor.users.update(user, {
            $push: {
                'services.resume.loginTokens': stampedToken
            }
        });

        var samlLogin = {
            idp: loginResult.profile.issuer,
            nameID: loginResult.profile.nameID
        };

        Meteor.users.update({
            _id: user._id
        }, {
            $set: {
                'services.saml': samlLogin
            }
        });

        //sending token along with the userId
        var result = {
            userId: user._id,
            token: stampedToken.token
        };

        return result

    } else {
        throw new Error("SAML Profile did not contain an email address");
    }
});

Accounts.saml._loginResultForCredentialToken = {};

Accounts.saml.hasCredential = function (credentialToken) {
    return _.has(Accounts.saml._loginResultForCredentialToken, credentialToken);
}

Accounts.saml.retrieveCredential = function (credentialToken) {
    // The credentialToken in all these functions corresponds to SAMLs inResponseTo field and is mandatory to check.
    var result = Accounts.saml._loginResultForCredentialToken[credentialToken];
    delete Accounts.saml._loginResultForCredentialToken[credentialToken];
    return result;
}



// Listen to incoming SAML http requests
WebApp.connectHandlers.use(connect.bodyParser()).use(function (req, res, next) {
    // Need to create a Fiber since we're using synchronous http calls and nothing
    // else is wrapping this in a fiber automatically
    Fiber(function () {
        middleware(req, res, next);
    }).run();
});

middleware = function (req, res, next) {
    // Make sure to catch any exceptions because otherwise we'd crash
    // the runner
    try {
        var samlObject = samlUrlToObject(req.url);
        console.log("In middleware: ");
        if (!samlObject || !samlObject.serviceName) {
            next();
            return;
        }

        if (!samlObject.actionName)
            throw new Error("Missing SAML action");

        var service = _.find(Meteor.settings.saml, function (samlSetting) {
            return samlSetting.provider === samlObject.serviceName;
        });

        // Skip everything if there's no service set by the saml middleware
        if (!service)
            throw new Error("Unexpected SAML service " + samlObject.serviceName);
        console.log("ACTION: " + samlObject.actionName);
        switch (samlObject.actionName) {
        case "metadata":
            _saml = new SAML(service);
            service.callbackUrl = Meteor.absoluteUrl("_saml/validate/" + service.provider);
            res.writeHead(200);
            res.write(_saml.generateServiceProviderMetadata(service.callbackUrl));
            closePopup(res);
            break;
        case "logout":
            _saml = new SAML(service);
            console.log("Service: " + JSON.stringify(service));
            var relayState = Meteor.absoluteUrl(); // used to be redirected back from IDP to our Meteor app
            res.writeHead(302, {
                'Location': service.logoutUrl + "&RelayState="+relayState
            });
            res.end();
            //closePopup(res);
            break;
        case "sloInit":
            _saml = new SAML(service);
            console.log("LOGOUT INITIATED");
            var relayState = Meteor.absoluteUrl();
            //debugger
            _saml.getLogoutUrl(req, function (err, url) {
                if (err)
                    throw new Error("Unable to generate SAML logout request");
                res.writeHead(302, {
                    'Location': url
                });
                res.end();
            });
            break;
        case "sloRedirect":
            break;
        case "authorize":
            service.callbackUrl = Meteor.absoluteUrl("_saml/validate/" + service.provider);
            service.id = samlObject.credentialToken;
            _saml = new SAML(service);
            _saml.getAuthorizeUrl(req, function (err, url) {
                if (err)
                    throw new Error("Unable to generate authorize url");
                res.writeHead(302, {
                    'Location': url
                });
                res.end();
            });
                break;
        case "validate":
            _saml = new SAML(service);
            _saml.validateResponse(req.body.SAMLResponse, req.body.RelayState, function (err, profile, loggedOut) {
                if (err)
                    throw new Error("Unable to validate response url: " + err);

                var credentialToken = profile.inResponseToId || profile.InResponseTo || samlObject.credentialToken;
                if (!credentialToken)
                    throw new Error("Unable to determine credentialToken");
                console.log("Checking CT: " + credentialToken);
                Accounts.saml._loginResultForCredentialToken[credentialToken] = {
                    profile: profile
                };
                closePopup(res);
            });
            break;
            default: throw new Error("Unexpected SAML action " + samlObject.actionName);
                
        }
    } catch (err) {
        closePopup(res, err);
    }
};

var samlUrlToObject = function (url) {
    // req.url will be "/_saml/<action>/<service name>/<credentialToken>"
    if (!url)
        return null;

    var splitPath = url.split('/');

    // Any non-saml request will continue down the default
    // middlewares.
    if (splitPath[1] !== '_saml')
        return null;

    var result = {
        actionName: splitPath[2],
        serviceName: splitPath[3],
        credentialToken: splitPath[4]
    };

    console.log(result);
    return result;
};

var closePopup = function (res, err) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    var content =
        '<html><head><script>window.close()</script></head><body><H1>Verified</H1></body></html>';
    if (err)
        content = '<html><body><h2>Sorry, an annoying error occured</h2><div>' + err + '</div><a onclick="window.close();">Close Window</a></body></html>';
    res.end(content, 'utf-8');
};