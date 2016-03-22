Meteor.methods({
  'createProject': function(project){
       GanttProjects.insert(project, function(error, success){
          if(error)
            {console.log(error)}
              else
                {console.log("Project id:" + success + " inserted into the collection of GanttProjects")}
         
       });
      },
  'deleteProject': function(project){
        if(project.owner === Meteor.user().username){
          GanttProjects.remove({_id: project._id}, 
            function(error, success){
              if(error)
                {console.log(error)}
                  else
                    {console.log(success + ' Project deleted from collection GanttProjects')}
          });
          Tasks.remove({projectId: project._id},function(error, success){
            if(error)
                {console.log(error)}
                  else
                    {console.log(success + ' associated tasks deleted from collection Tasks')}
          });
        }
      },
  'updateProjectName': function(projectId, projectName){
      GanttProjects.update({_id: projectId},{
        $set : {projectName: projectName}});
  },
  'submitTask': function(task){
       Tasks.insert(task, function(error, success){
          if(error)
            {console.log(error)}
              else
                {console.log("task id:" + success + " inserted into the collection of Tasks")}
         
       });
      },
  'updateTask': function(task){
     Tasks.update({_id: task._id}, task, function(error, success){
        if(error)
            {console.log(error)}
              else
                {console.log(success + ' Task Successfully updated :)')}
     });
  },
  'deleteTask': function(task){
      Tasks.remove({_id: task._id}, function(error, success){
          if(error)
            {console.log(error)}
              else
                {console.log(success + " task deleted from the collection of Tasks")}
      
    });
    
  },
  'registerTeamMember': function(teamName, teamPassword, username){     
        var a = Teams.update(
          {teamName : teamName,
           password : teamPassword},
          {'$push': {users: username}});
        console.log(username + " added to the team" + teamName);
        return a;
      },
  'createTeam': function(teamName, teamPassword, username){
        Teams.insert({
          teamName : teamName,
          password : teamPassword,
          teamAdmin: username,
          users    : [username]
        }, function(error, success){
              if(error)
                {console.log(error)}
                  else
                    {console.log(teamName + " id:" + success + " successfully saved to collection Teams")}
        });
      },
  'checkForTeam': function(teamName){
        console.log('checkForTeam function called');
        var woot = Teams.findOne({'teamName': teamName});
        return woot.teamName;
      }
});