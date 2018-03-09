Meteor-accounts-saml
==================

SAML v2 login support for existing password based accounts

Disclaimer
------

* **This package is working but may have issues with various saml providers** - it has only been tested and verified with [OpenIDP](https://openidp.feide.no/) and [OpenAM](https://www.forgerock.org/openam) and [WSO2](https://docs.wso2.com/display/IS541).
* Most SAML IDPs don't allow SPs with a _localhost (127.0.0.1)_  address. Unless you run your own IDP (eg via your own OpenAM instance) you might exprience issues.
* The accounts-ui loggin buttons will not include saml providers, this may be implemented as a future enhancement, see below for how to build a custom login button.


Tables of Contents
======

* [Usage](#usage)
  * [Setup SAML SP (Consumer)](#setup-saml-sp-consumer)
  * [OpenAM](#openam-setup)
  * [OpenIDP](#openidp-setup)
* [Demo](#demo)
* [Roadmap](#roadmap)
* [Credits](#credits)

## Usage

Add the following snippet to your settings.json file SAML:

_Keep in mind you only need to set `provider`, `entryPoint`, `issuer`, `idpSLORedirectURL`, `dynamicProfile` to be able to communicate successfully, unless you made extra configurations like encrypting the assertions which then you'd need to add `privateKeyFile` and `publicCertFile` properties to decrypt them and so on. So only use what you need._


```
"saml":[{
    "provider": "openam", // The name of your identity server provider.
    "entryPoint": "https://openam.idp.io/openam/SSORedirect/metaAlias/zimt/idp", // This is the URL that's used for communicating with the identity provider. It varies depending on your IDP, every IDP has its own unique version.
    "issuer": "https://sp.zimt.io/", // A unique identifier for the IDP to recognize which application is trying to initiate requests. It has to be the same in your IDP's configurations.
    "cert":"MIICizCCAfQCCQCY8tKaMc0 LOTS OF FUNNY CHARS ==",
    "idpSLORedirectURL": "http://openam.idp.io/openam/IDPSloRedirect/metaAlias/zimt/idp", // The URL that the user is going to be redirected on a successful logout process.
     "privateKeyFile": "certs/mykey.pem",  // Path is relative to $METEOR-PROJECT/private.
     "publicCertFile": "certs/mycert.pem",  // eg $METEOR-PROJECT/private/certs/mycert.pem
     "dynamicProfile": true // Set to true if we want to create a user in Meteor.users dynamically if SAML assertion is valid
     "identifierFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified", // Defaults to urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
     "localProfileMatchAttribute": "telephoneNumber" // CAUTION: this will be mapped to profile.<localProfileMatchAttribute> attribute in Mongo if identifierFormat (see above) differs from urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress,
     "attributesSAML": [telephoneNumber, sn, givenName, mail], // Attrs from SAML attr statement, which will be used for local Meteor profile creation. Currently no real attribute mapping. If required use mapping on IdP side.
  }]

```

In some template

```
<a href="#" class="saml-login" data-provider="openam">OpenAM</a>
```

In helper function

```
  'click .saml-login' (event) {
    event.preventDefault();
    var provider = event.target.getAttribute('data-provider');
    Meteor.loginWithSaml({
      provider
    }, function(error, result) {
      //handle errors and result
    });
  }
```

And if SingleLogout is needed

```
'click .saml-login' (event, template){
    event.preventDefault();
    var provider = event.target.getAttribute('data-provider');
    Meteor.logoutWithSaml({
	    provider
	}, function(error, result){
		//handle errors and result
    });
  }
```

## Setup SAML SP (Consumer)

1. Create a Meteor project by `meteor create sp` and cd into it.
2. Add `steffo:meteor-accounts-saml`
3. Add `settings.json` in your root directory. And start passing in the values required for your IDP.
4. (Optional) Put your private key and your cert (not the IDP's one) into the "private" directory. Eg if your meteor project is at `/Users/steffo/sp` then place them in `/Users/steffo/sp/private`
5. Check if you can receive SP metadata eg via `curl http://localhost:3000/_saml/metadata/openam`. Output should look like:

```
<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" entityID="http://localhost:3000/">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor>
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>MKA.... lot of funny chars ... gkqhkiG9w0BAQUFADATMREwDwYDVQQDEwgxMC4w
		  </ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
      <EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes256-cbc"/>
      <EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#aes128-cbc"/>
      <EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#tripledes-cbc"/>
    </KeyDescriptor>
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <AssertionConsumerService index="1" isDefault="true" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="http://localhost:3000/_saml/validate/openam"/>
  </SPSSODescriptor>
</EntityDescriptor>
  ```

## OpenAM Setup

1. I prefer using OpenAM realms. Set up a realm using a name that matches the one in the entry point URL of the `settings.json` file: `https://openam.idp.io/openam/SSORedirect/metaAlias/<YOURREALM>/idp`; we used `zimt` above.
2. Save the SP metadata (obtained in Step 5 above) in a file `sp-metadata.xml`.
3. Logon OpenSSO console as `amadmin` and select _Common Tasks > Register Remote Service Provider_
4. Select the corresponding real and upload the metadata (alternatively, point OpenAM to the SP's metadata URL eg `http://sp.meteor.com/_saml/metadata/openam`). If all goes well the new SP shows up under _Federation > Entity Providers_

## Encryption
The `<EncryptedAssertion>` element represents an assertion in encrypted fashion, as defined by the XML Encryption Syntax and Processing specification [XMLEnc](http://www.w3.org/TR/2002/REC-xmlenc-core-20021210/). Encrypted assertions are intended as a confidentiality protection mechanism when the plain-text value passes through an intermediary. 

The following schema fragment defines the `<EncryptedAssertion>` element: 
```
<element name="EncryptedAssertion" type="saml:EncryptedElementType"/>
```
In case the SAML response contains an `<EncryptedAssertion>` element and the configuration key `privateKey` is set, the assertion get's decrypted and handled like it would be an unencrypted one.

## OpenIDP Setup
- EntryID = http://accounts-saml-example.meteor.com
- Name of Service = meteor-accounts-saml-example
- AssertionConsumerService endpoint = http://accounts-saml-example.meteor.com/_saml/validate/openidp/

## Demo

For OpenIDP, see the example app `example-openidp`.

For OpenAM, see the example app `openam-example`.

## Roadmap
* Introduction of IDP types (eg openam, auth0 etc) to support implementaion specific workarounds.
* Support for different SAML Bindings
* Check for better/alternative SAML profile. I have the impression that the SAML Web Browser SSO profile somewhat conflicts with Meteor's DDP/websocket approach. Eg when the browser issues an HTTP request, Meteor apps don't necessarily know from which user/session this request comes from (ja, we could use cookies but that's not the the Meteor-way).

## Credits
Based Nat Strauser's Meteor/SAML package _natestrauser:meteor-accounts-saml_ which is
heavily derived from https://github.com/bergie/passport-saml.
