Router.route('/register');
Router.route('/login');
Router.route('/project/:_id', function(){

          this.render('project', {
            data: function () {
              return GanttProjects.findOne({_id: this.params._id});
            }
          });
        
});

Router.route('/', {
    name: 'home',
    template: 'home',
    onBeforeAction: function(){
        var currentUser = Meteor.userId();
        
      
        if(!currentUser){
            Router.go('/login');
        }
      
        var currentUserTeam = Meteor.user().profile.teamName
      
        if(currentUserTeam === ''){
          this.render('teamRegister')
        }else{
            console.log('home page accessed');
            this.next();
        }
    }
});

Router.configure({
    layoutTemplate: 'main'
});