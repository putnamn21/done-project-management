Template.login.events({
  'submit form': function(event){
        event.preventDefault();
            
        var username = $('[name=username]').val();
        var password = $('[name=password]').val();
    
    $('[name=username]').val('');
    $('[name=password]').val('');

        Meteor.loginWithPassword({username:username}, password, function(error){
              if(error){
                $('#failed').text(error.reason);
                $('#failed').show();
                setTimeout(function(){
                  $('#failed').fadeOut(1000);
                }, 1000)
              } else {
                  $('form.login').fadeOut(500);
                  $('form').siblings('p').fadeOut(200);
                  $('h2').addClass('successful-login');
                  setTimeout(function(){
                    Router.go("/");
                  }, 2000) 
              }
      });
    }
});


Template.register.events({
    'submit form': function(event){
      
      function failed(message){
        $('#failed').text(message);
        $('#failed').show();
        setTimeout(function(){
          $('#failed').fadeOut(1000);
        }, 1000)
      }
    
        event.preventDefault();
      
        var username =  $('[name=username]').val();
        var email =     $('[name=email]').val();
        var password =  $('[name=password]').val();
        var password2 = $('[name=password2]').val();
        var teamName = $('[name=team]').val();
        var teamPass = $('[name=teampassword]').val();
      
        var usernameTest = /^@/.test(username);
      
        if(!usernameTest){
          failed('Username needs to start with @');
          return
        }
      
        if(password !== password2){
          failed('Passwords did not match');
          return
        }
      
      //only run db query if user entered info into team field, make sure to do all other data validation before this!
      
      
      if (teamName !== ''){
          // Meteor call, if team is found and password correct, will add username to team users and return 1, if team not found or password incorrect will return 0 
          Meteor.call('registerTeamMember', teamName, teamPass, username, function(error, result){
            
            if(error){console.log(error.reason)}else{
            // result is either going to be 1 if found or 0
            teamWasFound(result);  
            }
          });
        } else{teamWasFound(1)}
      
      
      function teamWasFound(result){
        
      if(result == 1){
        Accounts.createUser({
              username: username,
              password: password,
              profile: {
                email: email,
                teamName: teamName,
              }

              }, function(error){
                if(error){
                      console.log(error.reason); // Output error if registration fails
                  } else {
                  $('form.register').fadeOut(500);
                  $('form').siblings('p, hr').fadeOut(200);
                  $('h2').addClass('successful-login');
                  setTimeout(function(){
                    Router.go("/");
                  }, 2000)
                    
                       // Redirect user if registration succeeds
                  }
              });
        }else{
          failed("Failed to find Team");
        }
      }
    }
});
