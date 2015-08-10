if (Meteor.isClient) {
    Template.samlDemo.events({
        'click .saml-login': function (event, template) {
            event.preventDefault();
            var provider = $(event.target).data('provider');
            Meteor.loginWithSaml({
                provider: provider
            }, function (error, result) {
                //handle errors and result
            });
        },
        'click .saml-logout': function (event, template) {
            event.preventDefault();
            var provider = $(event.target).data('provider');
            //Meteor.logout();
//            Meteor.call("samlLogout", "Good bye", function(err, result){
//                            console.log("LOC " + result);
//            window.location.replace(result);
//            });

                        Meteor.logoutWithSaml({
                            provider: provider
                        }, function (error, result) {
                            if (error) {
                             console.log(error.toString());   
                            } else {
                                //Meteor.logout();
                            }
                        });
        },
        'click .meteor-logout': function (event, template) {
            event.preventDefault();
            Meteor.logout();
        }
    });
}


if (Meteor.isServer) {
    console.log(">>>>>  " + this.userId);
    Meteor.methods({
        addTask: function (text) {
            // Make sure the user is logged in before inserting a task
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }
        }
    })
}