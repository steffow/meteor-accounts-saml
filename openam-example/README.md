#Examples for _steffo:meteor-accounts-saml_

There are currently two SAML IDPs supported by the examples.

- ForgeRock's OpenAM (open-source, can be run locally)
- Feide's OpenIDP (run as a service, free to register)

### Step 1. Create a Meteor project

First clone the GitHub project in your local filesystem. From your command line run

``` 
$ meteor create openam
$ cd openam

```

After that, run

```
$ cp -rp meteor-accounts-saml/openam-example/* .
$ meteor add accounts-password
$ meteor add accounts-ui
$ meteor add steffo:meteor-accounts-saml
```

Make sure that you add/change the user in `server/config.js` and that `initialBoot = true`in the same file. This will create a local Meteor user. 

### Step 2. Make sure that IDP and SP know each other

The IDP configuration is reflected in the file `server/lib/settings.js`. Basically we only need to know the Login URL (`entryPoint`) and IDP's cert. Optionally, we can use the Single Logout URL.

The SP configuration can be obtained by accessing eg `http://localhost:3000/_saml/metadata/forgerock` provided you have a SAML provider name `forgerock`in your `settings.js`. In OpenAM, you can create an SP configuration simply by pointing OpenAM to that Metadata URL.