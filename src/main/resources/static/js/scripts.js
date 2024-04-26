//$(document).ready(function() {
//    // Initially disable the button
//    $('#testButton').prop('disabled', true);
//
//    // Enable the button if any checkboxes are selected
//    $('.backlogCheckbox').change(function() {
//        if ($('.backlogCheckbox:checked').length > 0) {
//            $('#testButton').prop('disabled', false);
//        } else {
//            $('#testButton').prop('disabled', true);
//        }
//    });
//
//    $('#testButton').click(function() {
//        // Empty the lists first
//        $('#sprintsTable').empty();
//        $('#selectedTasksList').empty();
//
//         var selectedItems = $('.backlogCheckbox:checked');
//         var listGroup = $('<ul>').addClass('list-group list-group-flush');
//        // Collect selected backlog IDs
//        var selectedBacklogIds = $('.backlogCheckbox:checked').map(function() {
//            return $(this).val();
//        }).get();
//         if (selectedItems.length > 0) {
//             selectedItems.each(function(index) {
//                 var selectedTask = $(this).closest('tr').find('td:nth-child(3)').text();
//                 // Append each selected item to the list group with serial number
//                 listGroup.append('<li class="list-group-item">' + (index + 1) + '. ' + selectedTask + '</li>');
//             });
//
//             // Create a Bootstrap card body
//             var cardBody = $('<div>').addClass('card-body').append(listGroup);
//
//             // Create a Bootstrap card with adjusted width
//             var card = $('<div>').addClass('card').css('max-width', '30rem');
//             card.append($('<div>').addClass('card-header').text('Selected Tasks'));
//             card.append(cardBody);
//
//             // Empty the modal content and append the card
//             $('#selectedTasksList').empty().append(card);
//
//             // Show the modal
//             $('#selectedTasksModal').modal('show');
//         } else {
//             // Show a message if no items are selected
//             listGroup.append('<li class="list-group-item">Nothing got selected</li>');
//
//             // Empty the modal content and append the list group
//             $('#selectedTasksList').empty().append(listGroup);
//
//             // Show the modal
//             $('#selectedTasksModal').modal('show');
//         }
//
//
//        // Create a line of text and append it to the selectedTasksList
//       var lineOfText = $('<h4>').addClass('text-center text-info').text('Select a sprint');
//       $('#selectedTasksList').append(lineOfText);
//
//        // Fetch sprints and append them to the modal
//        $.ajax({
//            url: 'http://localhost:8080/api/sprints',
//            type: 'GET',
//            success: function(sprints) {
//                // Create a table element with Bootstrap classes
//                var table = $('<table>').addClass('table table-striped');
//
//                // Create table header with Bootstrap classes
//                var tableHeader = $('<thead>').html('<tr><th>Name</th><th>Sprint Status</th><th>Starting Date</th><th>Ending Date</th><th>Team</th><th>Action</th></tr>');
//                table.append(tableHeader);
//
//                // Create table body
//                var tableBody = $('<tbody>');
//
//                // Loop through each sprint
//                sprints.forEach(function(sprint) {
//                    // Create a new row for each sprint
//                    var row = $('<tr>');
//
//                    // Add sprint details to the row
//                    row.append($('<td>').text(sprint.name));
//                    row.append($('<td>').text(sprint.sprintStatus));
//                    row.append($('<td>').text(sprint.startingDate));
//                    row.append($('<td>').text(sprint.endingDate));
//                    row.append($('<td>').text(sprint.team.name));
//
//                    // Add a button to the row
//                    var button = $('<button>').addClass('btn btn-primary').text('Action');
//                    button.click(function() {
//                        // Handle button click event here
//                        alert('Button clicked for ' + sprint.name);
//                    });
//                    row.append($('<td>').append(button));
//
//                    // Append the row to the table body
//                    tableBody.append(row);
//                });
//
//                // Append the table body to the table
//                table.append(tableBody);
//
//                // Append the table to the selectedTasksList
//                $('#selectedTasksList').append(table);
//            }
//        });
//    });
//});

$(document).ready(function() {
    // Initially disable the button
    $('#testButton').prop('disabled', true);

    // Enable the button if any checkboxes are selected
    $('.backlogCheckbox').change(function() {
        if ($('.backlogCheckbox:checked').length > 0) {
            $('#testButton').prop('disabled', false);
        } else {
            $('#testButton').prop('disabled', true);
        }
    });

    $('#testButton').click(function() {
        // Empty the lists first
        $('#sprintsTable').empty();
        $('#selectedTasksList').empty();

         var selectedItems = $('.backlogCheckbox:checked');
         var listGroup = $('<ul>').addClass('list-group list-group-flush');
        // Collect selected backlog IDs
        var selectedBacklogIds = $('.backlogCheckbox:checked').map(function() {
            return $(this).val();
        }).get();
        // Create a line of text and append it to the selectedTasksList
                var lineOfText = $('<h4>').addClass('text-center text-info').text('Select a sprint');
                $('#selectedTasksList').append(lineOfText);

         if (selectedItems.length > 0) {
             selectedItems.each(function(index) {
                 var selectedTask = $(this).closest('tr').find('td:nth-child(3)').text();
                 // Append each selected item to the list group with serial number
                 listGroup.append('<li class="list-group-item">' + (index + 1) + '. ' + selectedTask + '</li>');
             });

             // Create a Bootstrap card body
             var cardBody = $('<div>').addClass('card-body').append(listGroup);

             // Create a Bootstrap card with adjusted width
             var card = $('<div>').addClass('card').css('max-width', '30rem');
             card.append($('<div>').addClass('card-header').text('Selected Tasks'));
             card.append(cardBody);

             // Empty the modal content and append the card
             $('#selectedTasksList').empty().append(card);

             // Show the modal
             $('#selectedTasksModal').modal('show');
         } else {
             // Show a message if no items are selected
             listGroup.append('<li class="list-group-item">Nothing got selected</li>');

             // Empty the modal content and append the list group
             $('#selectedTasksList').empty().append(listGroup);

             // Show the modal
             $('#selectedTasksModal').modal('show');
         }


        // Create a line of text and append it to the selectedTasksList
       var lineOfText = $('<h4>').addClass('text-center text-info').text('Select a sprint');
       $('#selectedTasksList').append(lineOfText);

        // Fetch sprints and append them to the modal
        $.ajax({
            url: 'http://localhost:8080/api/sprints',
            type: 'GET',
            success: function(sprints) {
                // Create a table element with Bootstrap classes
                var table = $('<table>').addClass('table table-striped');

                // Create table header with Bootstrap classes
                var tableHeader = $('<thead>').html('<tr><th>Name</th><th>Sprint Status</th><th>Starting Date</th><th>Ending Date</th><th>Team</th><th>Action</th></tr>');
                table.append(tableHeader);

                // Create table body
                var tableBody = $('<tbody>');

                // Loop through each sprint
                sprints.forEach(function(sprint) {
                    // Create a new row for each sprint
                    var row = $('<tr>');

                    // Add sprint details to the row
                    row.append($('<td>').text(sprint.name));
                    row.append($('<td>').text(sprint.sprintStatus));
                    row.append($('<td>').text(sprint.startingDate));
                    row.append($('<td>').text(sprint.endingDate));
                    row.append($('<td>').text(sprint.team.name));

                    // Add a button to the row
                    var button = $('<button>').addClass('btn btn-primary').text('Action');
                    button.click(function() {
                        // Handle button click event here
                           $.ajax({
                                url: 'http://localhost:8080/api/sprints/' + sprint.id + '/assign-backlogs',
                                type: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify(selectedBacklogIds),
                                success: function() {
                                    alert('Backlogs assigned to sprint ' + sprint.name);
                                },
                                error: function() {
                                    alert('Failed to assign backlogs to sprint ' + sprint.name);
                                }
                            });
                    });
                    row.append($('<td>').append(button));

                    // Append the row to the table body
                    tableBody.append(row);
                });

                // Append the table body to the table
                table.append(tableBody);

                // Append the table to the selectedTasksList
                $('#selectedTasksList').append(table);
            }
        });
    });
});

