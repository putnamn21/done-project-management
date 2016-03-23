// need to find all the tasks, and projects associated with this user and show them on the screen. It may also be nice to show teammates.                                                                               
//When you click on the project, it will need to store a session variable with the project id, then on the next page render the project associated with that session variable!                                                                                          
//the next peice will be ones ability to edit that tasks that have been assigned to them by marking them a certain percentage complete... 



//*****************HELPERS*******************HELPERS**********HELPERS**********HELPERS**********HELPERS

Template.home.helpers({
  'myProjects':function(){
    
    var user = Meteor.user().username;
    
    console.log(user);
    
    //find the projects that you own
    var projects = GanttProjects.find({'owner': user}).fetch();
    
    return projects;
    
  },
  'projects': function(){
    var userName = Meteor.user().username;
    
    //find all the tasks you are a part of
    var tasks = Tasks.find({'assignments' : { $in: [userName] }}).fetch();
    
    //store the projectIds in an array
    var tasksProjectIds = [];
    for (var i = 0; i<tasks.length; i++){
      tasksProjectIds.push(tasks[i].projectId)
    }
    //sort the project Ids in order
    tasksProjectIds.sort();
    
    //remove duplicates
    var cleansedTaskArray = []
    for (var i = 0; i<tasksProjectIds.length; i++){
      if(tasksProjectIds[i]==tasksProjectIds[i+1]) {continue}
    cleansedTaskArray[cleansedTaskArray.length]=tasksProjectIds[i];
    }
    console.log(cleansedTaskArray);
    
    var projects = []
    
    //for each project id in cleansedTaskArray add it to the project array
    for (var i = 0; i<cleansedTaskArray.length; i++){
      console.log(cleansedTaskArray[i]);
      //for each task, find the associated project
      var project = GanttProjects.findOne({_id: cleansedTaskArray[i]})
      console.log(project);
      projects.push(project);
    }
    
    //now i have a list of projects i am in, and i want to now insert the tasks i am a part of into the projects
    
    var projectsWithTasks = [];
    console.log(projects, 'projects: true');
    
    for (var i = 0; i<projects.length; i++){
      var thisProject = projects[i];
      console.log(thisProject);
      for (var j = 0; j<tasks.length; j++ ){
        if(tasks[j].projectId === thisProject._id){
          thisProject.tasks.push(tasks[j])
        }
      }
      projectsWithTasks.push(thisProject);
    }
    
    
    console.log(projectsWithTasks);
    //send it to the user :) wish we had ES6. this would be a lot easier
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


