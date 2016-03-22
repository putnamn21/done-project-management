Template.teamRegister.events({
  'submit #joinTeam': function(event){
    event.preventDefault();
    
    //grabs form data
    var teamName = event.target.team.value;
    var teamPassword = event.target.teampassword.value;
    var username = Meteor.user().username;
    
    
   Meteor.call('registerTeamMember', teamName, teamPassword, username, function(error, result){
            
            if(error){console.log(error.reason)}else{
            // result is either going to be 1 if found or 0
            teamWasFound(result);  
            }
          });
    function teamWasFound(result){
      console.log(result);
      if(result == 1){
        $('#joinTeam, .team-register').fadeOut(500);
                  $(".team-join").children('h2').addClass('successful-login');
                  setTimeout(function(){
                    Meteor.users.update(Meteor.userId(), 
                      {$set:{'profile.teamName' : teamName}});
                  }, 2000) 
      } else {
        $('#teamFound').text("Team not found");
                $('#teamFound').show();
                setTimeout(function(){
                  $('#teamFound').fadeOut(1000);
                }, 1000);
      }
    }
    
    event.target.team.value = '';
    event.target.teampassword.value = '';
  },
  'submit #formTeam': function(event){
    event.preventDefault();
    
    var teamName = event.target.team.value;
    var teamPassword = event.target.teampassword.value;
    var username = Meteor.user().username;
    
    var validTeamName = /^#/.test(teamName);
    
    if(!validTeamName){
      $('#failed').text("Invalid Team Name. Must start with a '#'");
                $('#failed').show();
                setTimeout(function(){
                  $('#failed').fadeOut(1000);
                }, 1000);
      return;
    }
    
    //checks to see if team already exists
    Meteor.call('checkForTeam', teamName, function(error, result){
      if(error){
        console.log(error.reason);
        create();
        return;
      }

          console.log(result);
      
          $('#failed').text(result + " teamname already exists");
                $('#failed').show();
                setTimeout(function(){
                  $('#failed').fadeOut(1000);
                }, 1000);
    });
    
    function create(){
       $('#formTeam, .team-join').fadeOut(500);
                  $(".team-register").children('h2').addClass('successful-login');
                  $('.team-register').children('hr, p').hide();
                  setTimeout(function(){
                      Meteor.call('createTeam', teamName, teamPassword, username, function(error, result){
                            if(error){console.log(error.reason)
                                     }else{ 
                              Meteor.users.update(Meteor.userId(), 
                                 {$set:{'profile.teamName' : teamName}});
                              }
                            }
                          )}, 2000);                             
      }
    
    
    event.target.team.value = '';
    event.target.teampassword.value = '';
    
  }
});