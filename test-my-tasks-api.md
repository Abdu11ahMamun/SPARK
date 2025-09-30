# My Tasks API Testing Guide

## Backend API Endpoints Created

### 1. Get My Tasks
**Endpoint:** `GET /api/my-tasks/{username}`
**Description:** Retrieves all tasks assigned to a user in their current active sprints
**Example:** `GET /api/my-tasks/john.doe`

### 2. Update Task Status
**Endpoint:** `PUT /api/my-tasks/update-status/{taskId}`
**Description:** Updates the status of a specific task
**Body:** `{"status": "IN_PROGRESS"}`
**Example:** `PUT /api/my-tasks/update-status/123`

### 3. Get User Teams with Current Sprints
**Endpoint:** `GET /api/my-tasks/{username}/teams`
**Description:** Retrieves all teams the user belongs to with their current sprint information
**Example:** `GET /api/my-tasks/john.doe/teams`

## Frontend Angular Implementation

### TaskService Methods
- `getMyTasks(username: string)` - Calls `/api/my-tasks/{username}`
- `updateTaskStatus(taskId: number, newStatus: string)` - Calls `/api/my-tasks/update-status/{taskId}`
- `getUserTeamsWithSprints(username: string)` - Calls `/api/my-tasks/{username}/teams`

### MyTasksComponent Features
- **Kanban Board Layout:** 4 columns (To Do, In Progress, Blocked, Done)
- **Drag & Drop:** Users can drag tasks between status columns
- **Real-time Updates:** Task status changes are immediately sent to the backend
- **Sprint Information:** Shows current active sprints for the user
- **Responsive Design:** Modern, mobile-friendly interface
- **Mock Data Fallback:** If API fails, shows sample tasks for development

## How It Works

1. **User Authentication:** Component gets the current username from AuthService
2. **Load Tasks:** Calls the backend API to get tasks for current sprints
3. **Display Kanban:** Organizes tasks into status-based columns
4. **Update Status:** When user drags a task, calls the update API
5. **Refresh Data:** Users can manually refresh to get latest data

## Key Backend Logic

### Current Sprint Detection
```java
private List<Sprint> getCurrentSprintsForUser(String username) {
    // Find all teams the user belongs to
    // For each team, find the current sprint based on date range
    // A sprint is current if: start_date <= today <= end_date
}
```

### Task Filtering
```java
private List<BacklogTask> getTasksForCurrentSprints(String username, List<Sprint> currentSprints) {
    // Get all tasks assigned to the user (assignedto field)
    // Filter tasks that belong to the current sprints
    // Return filtered list
}
```

## Testing the Integration

1. **Start Backend:** Make sure the Spring Boot application is running
2. **Start Frontend:** Run `npm start` in the Angular project
3. **Navigate:** Go to `http://localhost:4200/my-tasks`
4. **Test Features:**
   - Verify tasks load (will show mock data if backend API is not available)
   - Try dragging tasks between columns
   - Check browser console for API calls
   - Use refresh button to reload data

## Expected Behavior

- **If Backend is Running:** Real tasks from database are displayed
- **If Backend is Not Running:** Mock tasks are displayed for development
- **Task Updates:** Dragging tasks between columns updates the database
- **Error Handling:** Graceful fallback to mock data if API calls fail

## Development Notes

- The frontend is designed to work with or without the backend for development
- Mock data ensures the UI can be tested independently
- API endpoints follow RESTful conventions
- Error handling provides good user experience even when APIs fail