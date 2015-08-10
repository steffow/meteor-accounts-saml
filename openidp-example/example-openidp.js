if (Meteor.isClient) {
  Template.samlDemo.events({
    'click .saml-login': function(event, template){
      event.preventDefault();
      var provider = $(event.target).data('provider');
      Meteor.loginWithSaml({
        provider:provider
    }, function(error, result){
      //handle errors and result
      });
    }
  });
}