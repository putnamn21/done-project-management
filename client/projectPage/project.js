
//******************EVENTS*********************EVENTS**************************


      //***** Project Events ******

            Template.project.events({
              'submit .task-form': function(event){

                 event.preventDefault();

                  // form validation
                        //returns an array of dependencies
                        var dependenciesList = $('.task-form').find('[name=dependencies]').val();

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

                  // creates task object
                       var data = { 
                         projectId: this._id,
                         name: event.target.name.value,
                         resource: event.target.category.value,
                         start: start,
                         duration: duration,
                         percentComplete: 0,
                         assignments: assignments,
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
              'click #deleteProject': function(event){
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
              'click #editProject': function(event){
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
            });//end of Project Events



      //***** Project Tasks Events ******

          Template.projectTasks.events({

            'click .deleteTask': function(event){

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
                //form validation
                  //corrects time zone difference but may be null
                    var start = event.target.start.value
                    if (start === '') {
                      start = null;
                    } else {
                      start = new Date(start);
                      start = new Date(start.getTime()+start.getTimezoneOffset()*60000);
                    }
                  //returns an array of dependencies
                    var dependenciesList = $(event.target).find('[name=dependencies]').val();
                  //turns duration into a number
                    var duration = parseInt(event.target.duration.value);
                  //parses assignments into an array
                    var assignments = $(event.target).find('[name=assignments]').val();
                    console.log(assignments);



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

          });//end of Project Task Events



//******************HELPERS*********************HELPERS**************************


      Template.projectTasks.helpers({

        'assignmentSelected': function(teammates, task){

            var newArray = [];

            //Loop through our teammates and see if they match someone assigned to this task. If they do match mark selected as true else false. Only do this if there are assignments

                for (var i = 0; i<teammates.length; i++){
                  if(!task.assignments || task.assignments.indexOf(teammates[i]) === -1){
                    newArray.push({
                      name: teammates[i],
                      selected: false
                    });
                  } else {
                    newArray.push({
                      name: teammates[i],
                      selected: true
                    });
                  }
                }

            //send the new array with teammates marked as either selected for the task or not
              
              return newArray;
          }
      });


//************** ON-RENDERED FUNCTIONS*********************** ON-RENDERED FUNCTIONS******

      Template.projectTasks.onRendered(function(){
        console.log('project task on rendered loaded');
        $('.deleteTask, .editable-details, .task-labels, .detail, .task-form').hide();
      });

      Template.project.onRendered(function () {
        
        console.log('project page on rendered called');
          
      //Binds function to onRendered event and when underlying data changes
        this.autorun(function() {
          console.log('project data autorun function called');  
          
          //Grab the project and associated tasks
            var projectId = this.data._id;
            var tasks = Tasks.find({'projectId': projectId}).fetch();
            // If there are not tasks, kill the function and render the message
                if(tasks[0] == undefined){
                  $('#chart-container').append("<h3 class='text-center color-blue'>You have not set up any Tasks yet. Click 'add task' to get started!</h3>");
                  return;
                };


          //Set the height of the chart container proportional to the number of tasks we have
            var chartHeight = tasks.length*40+100;
            $('.container, #chart-container').css("height", chartHeight);
          //Used by construct function below
            function daysToMilliseconds(days) {
              return days * 24 * 60 * 60 * 1000;
            };
          //Construct the gantt chart only when google.charts loads
            google.charts.setOnLoadCallback(constructChart);


          //Constructs the google chart. Calls the construct function to format object into Array, and calls the draw function and passes it the formatted data
            function constructChart(){

              var constructedTasks = [];

              //loops throught the project tasks and builds the data for our project to be displayed
                for (var i = 0; i< tasks.length; i++ ) {
                  constructedTasks.push(construct(tasks[i]));
                };
                console.log("task data: ",tasks);
                console.log('task data formatted for Google Chart: ', constructedTasks);
              //Pass the formatted tasks into the drawing function
                drawChart(constructedTasks);
            };

          //Function that turns task object into array formatted correctly for google charts
            function construct(taskObj) {

                var dependencies = taskObj.dependencies;

              //Take the dependencies array and turn it into a comma seperated string
                if (typeof dependencies != "string" && dependencies != null){
                  dependencies = dependencies.join();
                }
              //If there are no depenencies, set it to null
                if(dependencies === 'none'){
                  dependencies = null;
                }  

              //Construct and return the array         
                return [taskObj.name, taskObj.name, taskObj.resource, taskObj.start, null, daysToMilliseconds(taskObj.duration), taskObj.percentComplete, dependencies]

            };

          //This function actually draws the chart the page
            function drawChart(constructedTasks) {

                var data = new google.visualization.DataTable();

                data.addColumn('string', 'Task ID');
                data.addColumn('string', 'Task Name');
                data.addColumn('string', 'Resource');
                data.addColumn('date', 'Start Date');
                data.addColumn('date', 'End Date');
                data.addColumn('number', 'Duration');
                data.addColumn('number', 'Percent Complete');
                data.addColumn('string', 'Dependencies');

                data.addRows(constructedTasks);

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
              };


        }.bind(this));//end of main wrapping function

      });// End of project.onRendered