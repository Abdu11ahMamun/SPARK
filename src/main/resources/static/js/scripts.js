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
        // Empty the list first
        $('#selectedTasksList').empty();

        // Collect selected items
        var selectedItems = $('.backlogCheckbox:checked');
        if (selectedItems.length > 0) {
            selectedItems.each(function() {
                var selectedTask = $(this).closest('tr').find('td:nth-child(3)').text();
                // Append each selected item to the modal list
                $('#selectedTasksList').append('<li>' + selectedTask + '</li>');
            });

            // Show the modal
            $('#selectedTasksModal').modal('show');
        } else {
            // Show a message if no items are selected
            $('#selectedTasksList').append('<li>Nothing got selected</li>');
            $('#selectedTasksModal').modal('show');
        }
    });
});