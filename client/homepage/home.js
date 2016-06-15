

//*****************HELPERS*******************HELPERS**********HELPERS**********HELPERS**********HELPERS

Template.home.helpers({
  'myProjects':function(){
    
    var user = Meteor.user().username;
    
    //find the projects that you own
    var projects = GanttProjects.find({'owner': user}).fetch();
    
    return projects;
    
  },
  'projects': function(){
    
      var userName = Meteor.user().username;
    //find all the tasks the User is assigned
      var tasks = Tasks.find({'assignments' : { $in: [userName] }}).fetch();
    //store the projectIds in an array
      var tasksProjectIds = [];
      for (var i = 0; i<tasks.length; i++){
        tasksProjectIds.push(tasks[i].projectId)
      };
    //sort the project Ids in order
      tasksProjectIds.sort();
    //remove duplicates
      var cleansedIds = [];
      for (var i = 0; i<tasksProjectIds.length; i++){
        if(tasksProjectIds[i] == tasksProjectIds[i+1]){continue};
        cleansedIds.push(tasksProjectIds[i]);
      };
    //for each project id in cleansedIds[] add the matching project to projects[]
      var projects = [];
      for (var i = 0; i<cleansedIds.length; i++){
        //for each task, find the associated project
        var project = GanttProjects.findOne({_id: cleansedIds[i]});
        projects.push(project);
      };
    //assign each task the User is a part of to their perspective projects
    var projectsWithTasks = [];
    for (var i = 0; i<projects.length; i++){
      //loop through the tasks and add the task to the project if they match
      for (var j = 0; j<tasks.length; j++){
        if(tasks[j].projectId === projects[i]._id){
          projects[i].tasks.push(tasks[j])
        }
      };
      projectsWithTasks.push(projects[i]);
    }
    
    //send it to the user
    return projectsWithTasks;
  }
});


//*****************EVENTS*****************EVENTS*****************EVENTS*****************EVENTS*****************EVENTS

Template.home.events({
  'click #showForm': function(event){
    $('.new-project').find('form').slideToggle(250);
  },
  'submit .new-project': function(event){
    event.preventDefault();
    
    //create the project object
    var project = {
      projectName: event.target.projectName.value,
      owner: Meteor.user().username,
      team: Meteor.user().profile.teamName,
      tasks: []
    }
    // submit it to the database
    Meteor.call('createProject', project);
  
    
    $('.new-project').find('form').hide();
    event.target.projectName.value = '';
  },
  'click .projectLink':function(event){
    var id = this._id;
    Router.go('/project/'+id);
  }
});

Template.tasks.events({
  'mouseup .range-slider input':function(event){
    $(event.target).prev('h5').children('.saveProgress').show();
  },
  'click .saveProgress':function(event){
    $(event.target).parent('h5').next('input').trigger('submit');
    $('.range-slider__value').children('span').text('');
    $(event.target).hide();
  },
  'submit .range-slider__range': function(event){
    event.preventDefault();
    var task = this;
    task.percentComplete = parseInt(event.target.value);
    Meteor.call('updateTask', task);
  }
});


//*****************ON RENDERED*****************ON RENDERED*****************ON RENDERED*****************ON RENDERED


