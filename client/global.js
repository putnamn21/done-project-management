//GLOBAL HELPERS***************************************************************************************************************

Template.registerHelper("currentUser", function() {
  if(Meteor.user() === null){return}
  return Meteor.user().username;
});


Template.registerHelper("tasks", function(projectId) {
    return Tasks.find({'projectId': projectId}).fetch();
});
                        
Template.registerHelper("isOwner", function(owner) {
  if(Meteor.user() === null){return}  
  
  if(this.owner === Meteor.user().username){
      return true
    }else{
      return false
    }
});

Template.registerHelper("team", function() {
  
  if(Meteor.user() === null){return}
  
  var currentUserTeam = Meteor.user().profile.teamName;
  var a = Teams.findOne({teamName: currentUserTeam});
  return a
});
//END OF GLOBAL HELPERS************************************************************************************************************



//MAIN TEMPLATE EVENTS**************************************************************************************************************
Template.main.events({
  'click #logout': function(event){
    event.preventDefault();
    Meteor.logout();
    Router.go("login");
  },
  'click #tutorial': function(event){
      event.preventDefault();
      Session.set('messageViews', 0);
      Meteor.logout();
      console.log(Router.current().route.getName());
      if (Router.current().route.getName() !== 'login'){
        console.log('hello chap')
      Router.go("login");
      return}
      
      Session.set('messageViews', 0);

        $('#helperGuide').removeClass('helper-guide-appear');
        setTimeout(function(){
          $('#helperGuide').addClass('helper-guide-appear');
          $('#helperMessage').text("Hello! Im going to help guide you through this project! Please click 'next'"); 
        }, 500)
    
    
    
  },
  'click #hideHelper': function(event){
    Session.set('messageViews', undefined);
    $('#helperGuide').removeClass('helper-guide-appear');
  },
  'click #nextText': function(event){
        
        var page = Router.current().route.getName();

        console.log(page);
    
    
    //function to cycle the messages on each page
    function messageCycle(message){
        $('#helperMessage').addClass('helper-message-disappear');
          setTimeout(function(){
            $('#helperMessage').text(message);
            $('#helperMessage').removeClass('helper-message-disappear');
            $('#helperMessage').addClass('helper-message-appear');
          }, 500)
    };
    
    //LOGIN SCREEN MESSAGES*************************************************************************************
    
        if (page == 'login'){
            messageCycle("First, login with '@Nathan' as a UserName and 'password' as the Password");
        }
    
    //HOME SCREEN MESSAGES*************************************************************************************
    
        if(page == 'home'){
          
          
          //first message view
          if(Session.get('messageViews') === 0){
            
              Session.set('messageViews', 1);
                
              messageCycle('First, try clicking on a blue task and report your progress to the project admin');
            
              return;
          }
          //second message view
          if(Session.get('messageViews') === 1){
                Session.set('messageViews', 2);
                
                messageCycle("Explore some of the tasks' details. This will tell you who else is responsible for completing the task, how long it is expected to take, and so on...")  
            
                return
          }
          //third message view
          if(Session.get('messageViews') === 2){
                Session.set('messageViews', 3);
                
                messageCycle('Great! Now click on one of the projects you are the Admin of!')  
            
                return
          }
        
        }// END OF HOMEPAGE FUNCTIONS
    
    
        if(page == 'project.:_id'){
          
               //first message view
          if(Session.get('messageViews') === 0){
                Session.set('messageViews', 1);

                messageCycle('First, the green pencil button allows you to edit the name of your project and delete it! There is a prompt before a project actually is deleted');

                return;
          }
          //second message view
          if(Session.get('messageViews') === 1){
                Session.set('messageViews', 2);
                
                messageCycle("Notice, tasks appear here much like the last screen, giving you access to all the details. But, as the admin you can edit any part of the task with the 'edit' button.")  
            
                return;
          }
          //third message view
          if(Session.get('messageViews') === 2){
                Session.set('messageViews', 3);
                
                messageCycle("You can add tasks with the 'add task' button. Pretty self-explanitory. The project Gantt Chart will auto update when any changes are made.")  
            ;
                return
          }
          //forth message view
          if(Session.get('messageViews') === 3){
                Session.set('messageViews', 4);
                
                messageCycle("Thats about it! Head back to the home page and create a project from scratch if you would like!")  
            
                return
          }
        }//END OF PROJECT MESSAGES
    }
});



//TUTORIAL INITIAL PAGE MESSAGES*******************************************************************

Template.login.onRendered(function(){
  console.log(Session.get('messageViews'))
  if(Session.get('messageViews') === undefined){return}
  else if (Session.get('messageViews')>= 0){
  
    Session.set('messageViews', 0);

    $('#helperGuide').removeClass('helper-guide-appear');
    setTimeout(function(){
      $('#helperGuide').addClass('helper-guide-appear');
      $('#helperMessage').text("Hello! Im going to help guide you through this project! Please click 'next'"); 
    }, 500)
  }
});

Template.home.onRendered(function(){
  if(Session.get('messageViews') === undefined){return}
  
  else if (Session.get('messageViews')>= 0){
  
  Session.set('messageViews', 0);
  
  $('#helperGuide').removeClass('helper-guide-appear');
  setTimeout(function(){
    $('#helperGuide').addClass('helper-guide-appear');
    $('#helperMessage').text("In 'Your Projects' there are projects you have created, and in 'Your Tasks' you find projects and tasks that have been assigned to you."); 
  }, 500)
  }
});

Template.project.onRendered(function(){
  
  if(Session.get('messageViews') === undefined){return}
  else if (Session.get('messageViews')>= 0){

      Session.set('messageViews', 0);

      $('#helperGuide').removeClass('helper-guide-appear');
      setTimeout(function(){
        $('#helperGuide').addClass('helper-guide-appear');
        $('#helperMessage').text("Whew! Now we are finally to the meat of application."); 
      }, 500)
  }
});