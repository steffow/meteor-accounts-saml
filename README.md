Meteor-accounts-saml
==================

SAML v2 login support for existing password based accounts

-----

## Demo

For OpenIDP, see the example app `example-openidp` and http://accounts-saml-example.meteor.com/ for a demo.

For OpenAM, see the example app `example-openam`.

## Important Notes

* **This package is working but may have issues with various saml providers** - it has only been tested and verified with [OpenIDP](https://openidp.feide.no/) and [OpenAM](https://www.forgerock.org/openam).
* Most SAML IDPs don't allow SPs with a _localhost (127.0.0.1)_  address. Unless you run your own IDP (eg via your own OpenAM instance) you might exprience issues.
* The accounts-ui loggin buttons will not include saml providers, this may be implemented as a future enhancement, see below for how to build a custom login button.

## Usage

Put SAML settings in eg `settings.json` like so:

```
"saml":[{
    "provider":"openam",
    "entryPoint":"https://openam.idp.io/openam/SSORedirect/metaAlias/zimt/idp",
    "issuer": "https://sp.zimt.io/", //replace with url of your app
    "cert":"MIICizCCAfQCCQCY8tKaMc0BMjANBgkqhkiG9w0BAQUFADCBiTELMAkGA1UEBhMCTk8xEjAQBgNVBAgTCVRyb25kaGVpbTEQMA4GA1UEChMHVU5JTkVUVDEOMAwGA1UECxMFRmVpZGUxGTAXBgNVBAMTEG9wZW5pZHAuZmVpZGUubm8xKTAnBgkqhkiG9w0BCQEWGmFuZHJlYXMuc29sYmVyZ0B1bmluZXR0Lm5vMB4XDTA4MDUwODA5MjI0OFoXDTM1MDkyMzA5MjI0OFowgYkxCzAJBgNVBAYTAk5PMRIwEAYDVQQIEwlUcm9uZGhlaW0xEDAOBgNVBAoTB1VOSU5FVFQxDjAMBgNVBAsTBUZlaWRlMRkwFwYDVQQDExBvcGVuaWRwLmZlaWRlLm5vMSkwJwYJKoZIhvcNAQkBFhphbmRyZWFzLnNvbGJlcmdAdW5pbmV0dC5ubzCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAt8jLoqI1VTlxAZ2axiDIThWcAOXdu8KkVUWaN/SooO9O0QQ7KRUjSGKN9JK65AFRDXQkWPAu4HlnO4noYlFSLnYyDxI66LCr71x4lgFJjqLeAvB/GqBqFfIZ3YK/NrhnUqFwZu63nLrZjcUZxNaPjOOSRSDaXpv1kb5k3jOiSGECAwEAATANBgkqhkiG9w0BAQUFAAOBgQBQYj4cAafWaYfjBU2zi1ElwStIaJ5nyp/s/8B8SAPK2T79McMyccP3wSW13LHkmM1jwKe3ACFXBvqGQN0IbcH49hu0FKhYFM/GPDJcIHFBsiyMBXChpye9vBaTNEBCtU3KjjyG0hRT2mAQ9h+bkPmOvlEo/aH0xR68Z9hw4PF13w==",
    
     "privateKeyFile": "certs/mykey.pem",  // path is relative to $METEOR-PROJECT/private
     "publicCertFile": "certs/mycert.pem"  // eg $METEOR-PROJECT/private/certs/mycert.pem
  }]
```

in some template

```
<a href="#" class="saml-login" data-provider="openam">OpenAM</a>
```

in helper function

```
'click .saml-login': function(event, template){
    event.preventDefault();
    var provider = $(event.target).data('provider');
    Meteor.loginWithSaml({
	    provider:provider
	}, function(error, result){
		//handle errors and result
    });
  }
```

and if SingleLogout is needed

```
'click .saml-login': function(event, template){
    event.preventDefault();
    var provider = $(event.target).data('provider');
    Meteor.logoutWithSaml({
	    provider:provider
	}, function(error, result){
		//handle errors and result
    });
  }
```

## Setup SAML SP (Consumer)

1. Create a Meteor project by `meteor create sp` and cd into it.
2. Add `steffo:meteor-accounts-saml`
3. Create a `settings.json` file as described above
4. Put your private key and your cert (not the IDP's one) into the "private" directory. Eg if your meteor project is at `/Users/steffo/sp` then place them in `/Users/steffo/sp/private`
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

##OpenAM Setup

1. I prefer using OpenAM realms. Set up a realm using a name that matches the one in the entry point URL of the `settings.json` file: `https://openam.idp.io/openam/SSORedirect/metaAlias/<YOURREALM>/idp`; we used `zimt` above.
2. Save the SP metadata (obtained in Step 5 above) in a file `sp-metadata.xml`.
3. Logon OpenSSO console as `amadmin` and select _Common Tasks > Register Remote Service Provider_
4. Select the corresponding real and upload the metadata. If all goes well the new SP shows up under _Federation > Entity Providers_ 



## OpenIDP setup
- EntryID = http://accounts-saml-example.meteor.com
- Name of Service = meteor-accounts-saml-example
- AssertionConsumerService endpoint = http://accounts-saml-example.meteor.com/_saml/validate/openidp/

## TBD
* Introduction of IDP types (eg openam, auth0 etc) to support implementaion specific workarounds.

## Credits
Based Nat Strauser's Meteor/SAML package _natestrauser:meteor-accounts-saml_ which is
heavily derived from https://github.com/bergie/passport-saml.

