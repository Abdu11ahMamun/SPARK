<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script>
$(document).ready(function() {
    $.ajax({
            url: '/teamMembers',
            type: 'GET',
            success: function(data) {
                console.log(data);
                var teamMembersList = '';
                $.each(data, function(index, member) {
                    teamMembersList += '<li>' + checkValue(member.name) + '</li>';
                });
                $('#team-members-list').html(teamMembersList);
            }
        });
    var sprintId = /* Insert your sprintId here */;
     $.ajax({
         url: '/tasks',
         type: 'GET',
         success: function(data) {
             console.log(data);
             var tasksTableRows = '';
             $.each(data, function(index, task) {
                 tasksTableRows += '<tr>' +
                     '<td>' + (index + 1) + '</td>' +
                     '<td>' + checkValue(task.name) + '</td>' +
                     '<td>' + checkValue(task.taskType) + '</td>' +
                     '<td>' + checkValue(task.category) + '</td>' +
                     '<td>' + checkValue(task.module) + '</td>' +
                     '<td>' + checkValue(task.description) + '</td>' +
                     '<td>' + checkValue(task.client) + '</td>' +
                     '<td>' + checkValue(task.priority) + '</td>' +
                     '<td>' + checkValue(task.assignedTo) + '</td>' +
                     '<td>' + checkValue(task.status) + '</td>' +
                     '<td>' + checkValue(task.storySize) + '</td>' +
                     '<td>' + checkValue(task.timeEstimate) + '</td>' +
                     '<td>' + checkValue(task.completedPoints) + '</td>' +
                     '<td>' + checkValue(task.completedHours) + '</td>' +
                     '<td>' + checkValue(task.actualHours) + '</td>' +
                     '<td>' + checkValue(task.dateOfDone) + '</td>' +
                     '<td>' + checkValue(task.remarks) + '</td>' +
                     '</tr>';
             });
             $('#tasks-table tbody').html(tasksTableRows);
         }error: function(jqXHR, textStatus, errorThrown) {
                  console.log("AJAX call failed: " + textStatus + ", " + errorThrown);
              }
     });
 });
});
</script>