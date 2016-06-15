
  Router.route('/register');
  Router.route('/login');


  Router.route('/project/:_id', function(){
    this.render('project', {
      data: function () {
        var a = GanttProjects.findOne({_id: this.params._id});

        if(a === undefined){
          Router.go('/');
        }
        console.log('project route called, and project passed to page');
        return a;
      }
    });
  });

  Router.route('/', {
      name: 'home',
      template: 'home',
      onBeforeAction: function(){
          var currentUser = Meteor.userId();
          if(currentUser){
            var currentUserTeam = Meteor.user().profile.teamName;
          }
        
          if(!currentUser){
            Router.go('/login');
          }else if (currentUserTeam === ''){
            this.render('teamRegister');
          }else{
            this.next();
          }
      }
  });

  Router.configure({
      layoutTemplate: 'main'
  });