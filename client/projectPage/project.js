
//******************EVENTS*********************EVENTS**************************

Template.project.events({
  'submit .task-form': function(event){
    
     event.preventDefault();
     
// form validation
            //returns an array of dependencies
            var dependenciesList = $('.task-form').find('[name=dependencies]').val();
            console.log(dependenciesList);
            
            // corrects time zone difference but may be null
            var start = event.target.start.value
            if(start === ''){
              start = null;
            }else
            {
            start = new Date(start);
            start = new Date(start.getTime()+start.getTimezoneOffset()*60000);
            }
            // turns duration into a number
            var duration = parseInt(event.target.duration.value);
            // parses assignments into an array
            var assignments = $('.task-form').find('[name=assignments]').val();
            console.log(assignments);

  // creates task object
           var data = { 
             projectId: this._id,
             name: event.target.name.value,
             resource: event.target.category.value,
             start: start,
             duration: duration,
             percentComplete: 0,
             assignments: assignments,//eventually needs to be a select list of multiple people based off of your team
             dependencies: dependenciesList,
             description: event.target.description.value,
             owner: Meteor.user().username
           }
     
  //submits it to the Database
           Meteor.call('submitTask', data);
  
  //clears the form and hides it  
            $('.task-form').slideUp(300);
            $('#addTask').text("Add Task");
            event.target.name.value = '';
            event.target.start.value = '';
            event.target.dependencies.value = '';
            event.target.duration.value = '';
            event.target.assignments.value = '';
            event.target.category.value = '';
            event.target.description.value = '';
  },
  'click #deleteProject': function(){
        var project = this;
        var choice = confirm('Are you sure you want to delete this project? You cannot undo this action.');
        if(choice){
          $(event.target).parents('.contain').fadeOut(500);
            setTimeout(function(){
              Meteor.call('deleteProject', project);
              Router.go('/');
              }, 750);
          }
  },
  'click #editProject': function(){
        if(!Session.get('editProject')){
          $('#editProject').removeClass('roundEdges');
          $('#editProject').children('span').removeClass('glyphicon-pencil');
          $('#editProject').children('span').addClass('glyphicon-check');
          $('#deleteProject').show();
          $('.head-label').hide();
          $('.head-label-edit').show();
          Session.set('editProject', true);
        } else{
          $('#editProject').addClass('roundEdges');
          $('#editProject').children('span').removeClass('glyphicon-check');
          $('#editProject').children('span').addClass('glyphicon-pencil');
          $('#deleteProject').hide();
          $('.head-label-edit').hide();
          $('.head-label').show();
          $('.head-label-edit').trigger('submit');
          Session.set('editProject', false);
        }
  },
  'submit .head-label-edit': function(event){
    event.preventDefault();
    
    var projectName = event.target.value;
    var projectId = this._id;
    
    Meteor.call('updateProjectName', projectId, projectName);
  }
});


Template.projectTasks.events({
  'click .deleteTask': function(){
    
    var choice = confirm('Are you sure you want to delete this Task?');
    
    if (choice) {
      Meteor.call('deleteTask', this);
    }
  },
  'click .editTask': function(event){
    var thisButton = event.target;
    
    
    if($(thisButton).text() === "Edit"){
      $(thisButton).text('Save');
      $(thisButton).removeClass('btn-warning');
      $(thisButton).addClass('btn-success');
      $(thisButton).prev('.deleteTask').show();
      $(thisButton).siblings('.task-details').find('.editable-details').show();
      $(thisButton).siblings('.task-details').find('.displayed-details').hide(); 
    }else{
      // get all the freaking form values
      
      $(thisButton).text('Edit');
      $(thisButton).removeClass('btn-success');
      $(thisButton).addClass('btn-warning');
      $(thisButton).prev('.deleteTask').hide();
      $(thisButton).siblings('.task-details').find('.editable-details').hide();
      $(thisButton).siblings('.task-details').find('.displayed-details').show();
      $(thisButton).siblings('.task-details').find('.editable-details').trigger('submit');
    }
  },
  'submit .editable-details': function(event){
    event.preventDefault();
    
    // form validation
            //returns an array of dependencies
            var dependenciesList = $(event.target).find('[name=dependencies]').val();
            
            // corrects time zone difference but may be null
            var start = event.target.start.value
            if(start === ''){
              start = null;
            }else
            {
            start = new Date(start);
            start = new Date(start.getTime()+start.getTimezoneOffset()*60000);
            }
            // turns duration into a number
            var duration = parseInt(event.target.duration.value);
            // parses assignments into an array
            var assignments = $(event.target).find('[name=assignments]').val();
            
    
    
    //edit the current task with new data
    
    var currentTask = this;
    
    currentTask.start = start;
    currentTask.duration = duration;
    currentTask.resource = event.target.category.value;
    currentTask.percentComplete = parseInt(event.target.percent.value);
    currentTask.assignments = assignments;
    currentTask.dependencies = dependenciesList;
    currentTask.description = event.target.description.value;
    
    //send it to the server :)
    Meteor.call('updateTask', currentTask);
    
    return false
  }
});


//******************HELPERS*********************HELPERS**************************




//************** ON RENDERED FUNCTIONS*****************


Template.project.onRendered(function () {
  $('.task-form').hide();
  
  
  //all of this renders on page load and also when the data changes
  this.autorun(function() {
  
  var projectId = this.data._id;
    
  var tasks = Tasks.find({'projectId': projectId}).fetch();
  
  var chartHeight = tasks.length*40+100;

  $('.container, #chart-container').css("height", chartHeight);

    //if user tries to access this page without a project it rejects them
    if(projectId === undefined){
        Router.go('/')
      }
     

      //once the google carts have loaded, this fires the code that constructs the gantt chart
      google.charts.setOnLoadCallback(constructChart);

         //constructs the chart data from our project object then calls the draw function
        function constructChart(){
          
          
          //THIS IS RUNNING FIRST AND THEN THE SUBMIT HAPPENS AND IT RUNS AGAIN.
          
          //see if there are any tasks
          if(tasks[0] !== undefined){
            ganttDisplay(tasks);
          }else{
            $('#chart-container').append("<h3 class='text-center color-blue'>You have not set up any Tasks yet. Click 'add task' to get started!</h3>")
          }   
          

              function daysToMilliseconds(days) {
                  return days * 24 * 60 * 60 * 1000;
                }

              function ganttDisplay (tasks){
              var constructedTasks = [];
              
              //loops throught the project tasks and builds the data for our project to be displayed
              for (var i = 0; i< tasks.length; i++ ) {
              constructedTasks.push(construct(tasks[i]));
              }
              //once we are done constructing the tasks for the project we call the draw function to put it on the page
              drawChart(constructedTasks);
                
              }

                  //This function runs in the for loop above
                  function construct(taskObj) {
                  
                  var dependencies = taskObj.dependencies;
                  
                  
                    
                  if (typeof dependencies != "string" && dependencies != null){
                    dependencies = dependencies.join();
                  }
                  if(dependencies === 'none'){
                    dependencies = null;
                  }
                  
                 
                  var array = [taskObj.name, taskObj.name, taskObj.resource, taskObj.start, null, daysToMilliseconds(taskObj.duration), taskObj.percentComplete, dependencies];
                  return array;
                  }
          }

          //This function actually draws the chart the page
          function drawChart(constructedChart) {
          
          var data = new google.visualization.DataTable();
          data.addColumn('string', 'Task ID');
	      data.addColumn('string', 'Task Name');
	      data.addColumn('string', 'Resource');
	      data.addColumn('date', 'Start Date');
	      data.addColumn('date', 'End Date');
	      data.addColumn('number', 'Duration');
	      data.addColumn('number', 'Percent Complete');
	      data.addColumn('string', 'Dependencies');


          data.addRows(constructedChart);///// pass in the array of arrays to be able to draw a gantt chart!

          var options = {
            gantt: {
            	arrow: {
            		angle: 70,
            		radius: 5
            	},
            }
          };

          var chart = new google.visualization.Gantt(document.getElementById("chart-container"));

          chart.draw(data, options);
        }
  }.bind(this));
    });


Template.projectTasks.onRendered(function(){
  $('.deleteTask, .editable-details, .task-labels, .detail').hide();
});