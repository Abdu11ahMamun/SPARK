# My Tasks API Documentation

## Overview
The My Tasks API provides session-based task management for authenticated users. It returns tasks assigned to the current user across all teams they belong to, filtered by current active sprints.

## Endpoints

### GET /api/my-tasks
Retrieves all tasks assigned to the authenticated user in current sprints.

**Authentication:** Required (Basic Auth)
**Method:** GET
**URL:** `/api/my-tasks`

**Response:**
```json
[
  {
    "id": 123,
    "title": "Implement user authentication",
    "description": "Add basic auth to the application",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "deadline": "2025-10-15",
    "assignedto": 456,
    "sprintid": 789,
    "teamId": 1,
    "points": 5,
    "createddate": "2025-10-01T09:00:00",
    "modifieddate": "2025-10-05T14:30:00"
  }
]
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8080/api/my-tasks" \
  -H "Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=" \
  -H "Content-Type: application/json"
```

### PATCH /api/my-tasks/{taskId}/status
Updates the status of a specific task.

**Authentication:** Required (Basic Auth)
**Method:** PATCH
**URL:** `/api/my-tasks/{taskId}/status`

**Request Body:**
```json
{
  "status": "DONE"
}
```

**Response:**
```json
{
  "id": 123,
  "title": "Implement user authentication",
  "description": "Add basic auth to the application",
  "status": "DONE",
  "priority": "HIGH",
  "deadline": "2025-10-15",
  "assignedto": 456,
  "sprintid": 789,
  "teamId": 1,
  "points": 5,
  "createddate": "2025-10-01T09:00:00",
  "modifieddate": "2025-10-05T15:45:00"
}
```

**cURL Example:**
```bash
curl -X PATCH "http://localhost:8080/api/my-tasks/123/status" \
  -H "Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=" \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE"}'
```

## Status Values
- `OPEN` - Task is open and ready to work
- `IN_PROGRESS` - Task is currently being worked on
- `BLOCKED` - Task is blocked and cannot proceed
- `DONE` - Task is completed
- `CANCELLED` - Task has been cancelled

## Priority Values
- `CRITICAL` - Must be done immediately
- `HIGH` - Important and should be done soon
- `MEDIUM` - Normal priority
- `LOW` - Can be done when time permits

## Backend Logic
1. **User Detection**: Username is derived from Spring Security's `Authentication.getName()`
2. **Team Filtering**: Tasks are filtered by teams the user belongs to
3. **Sprint Filtering**: Only tasks from current active sprints are returned
4. **Active Tasks**: Excludes tasks with status `DONE`, `COMPLETED`, or `CANCELLED`

## Angular Integration
The UI component `MyTasksComponent` uses these endpoints:

```typescript
// Load user's tasks
const myTasks = await this.http.get<TaskItem[]>(`${environment.apiUrl}/api/my-tasks`).toPromise();

// Update task status
await this.http.patch(`${environment.apiUrl}/api/my-tasks/${taskId}/status`, { status: newStatus }).toPromise();
```

## Error Handling
- **401 Unauthorized**: User is not authenticated
- **404 Not Found**: Task with specified ID not found
- **400 Bad Request**: Invalid status value provided
- **500 Internal Server Error**: Server error occurred

## Legacy Endpoints (Deprecated)
- `GET /api/my-tasks/user/{username}` - Use session-based endpoint instead
- `PUT /api/my-tasks/task/{taskId}/status` - Use PATCH endpoint instead