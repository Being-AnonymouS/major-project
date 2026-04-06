# Admin Management APIs Documentation

This document describes the admin management APIs implemented for the Mentor Connect platform.

## Authentication

All admin endpoints require:
1. Valid JWT token in Authorization header: `Bearer <token>`
2. User role must be `ADMIN`

## Endpoints

### 1. Get Users List
**GET** `/api/admin/users`

Retrieve paginated list of users with optional filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `role` (string, optional): Filter by role (`MENTOR`, `MENTEE`, `ADMIN`)
- `search` (string, optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "email": "user@example.com",
        "name": "User Name",
        "role": "MENTOR",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "expertise": "Web Development,JavaScript",
        "bio": "Experienced developer...",
        "yearsExperience": 5,
        "ratingAverage": 4.8,
        "_count": {
          "mentorAppointments": 10,
          "menteeAppointments": 0,
          "ratingsReceived": 8
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  },
  "message": "Users retrieved successfully"
}
```

### 2. Get User by ID
**GET** `/api/admin/users/:id`

Get detailed information for a specific user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "MENTOR",
    // ... other user fields
    "_count": {
      "mentorAppointments": 10,
      "menteeAppointments": 0,
      "ratingsReceived": 8,
      "ratingsGiven": 2,
      "sentMessages": 15
    }
  },
  "message": "User retrieved successfully"
}
```

### 3. Get Appointments List
**GET** `/api/admin/appointments`

Retrieve paginated list of appointments with optional filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `status` (string, optional): Filter by status (`REQUESTED`, `ACCEPTED`, `COMPLETED`, `CANCELLED`)
- `mentorId` (string, optional): Filter by mentor ID
- `menteeId` (string, optional): Filter by mentee ID
- `dateFrom` (ISO date string, optional): Filter appointments from this date
- `dateTo` (ISO date string, optional): Filter appointments to this date

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "appointment_id",
        "mentorId": "mentor_id",
        "menteeId": "mentee_id",
        "datetime": "2024-02-15T10:00:00.000Z",
        "status": "COMPLETED",
        "createdAt": "2024-02-01T00:00:00.000Z",
        "updatedAt": "2024-02-15T10:30:00.000Z",
        "mentor": {
          "id": "mentor_id",
          "name": "Mentor Name",
          "email": "mentor@example.com",
          // ... other mentor fields
        },
        "mentee": {
          "id": "mentee_id",
          "name": "Mentee Name",
          "email": "mentee@example.com",
          // ... other mentee fields
        },
        "_count": {
          "messages": 5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  },
  "message": "Appointments retrieved successfully"
}
```

### 4. Get Platform Statistics
**GET** `/api/admin/stats`

Get comprehensive platform statistics for admin dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "totalMentors": 30,
    "totalMentees": 65,
    "totalAppointments": 150,
    "completedAppointments": 120,
    "pendingAppointments": 20,
    "cancelledAppointments": 10,
    "averageRating": 4.7,
    "totalMessages": 500,
    "recentRegistrations": 15
  },
  "message": "Platform statistics retrieved successfully"
}
```

### 5. Update User Status
**PUT** `/api/admin/users/:id/status`

Update user status (suspend/activate). Note: This endpoint is prepared for future implementation when user status field is added to the database schema.

**Request Body:**
```json
{
  "status": "ACTIVE" | "SUSPENDED"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated user object
  },
  "message": "User status updated to ACTIVE successfully"
}
```

## Admin Action Logging

All admin actions are automatically logged with the following information:
- Admin user ID who performed the action
- Action type (VIEW_USERS, VIEW_APPOINTMENTS, etc.)
- Target type (USER, APPOINTMENT, SYSTEM)
- Target ID (if applicable)
- Detailed description of the action
- Timestamp

Logs are stored in memory and include:
- Request method and path
- Query parameters (if any)
- Request body fields (if any)
- Action-specific context

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

Common error codes:
- `MISSING_TOKEN`: No authorization token provided
- `INVALID_TOKEN`: Invalid or expired token
- `INSUFFICIENT_PERMISSIONS`: User is not an admin
- `INVALID_USER_ID`: Invalid user ID format
- `USER_NOT_FOUND`: User does not exist
- `INVALID_STATUS`: Invalid status value
- `GET_USERS_ERROR`: Error retrieving users
- `GET_APPOINTMENTS_ERROR`: Error retrieving appointments
- `GET_STATS_ERROR`: Error retrieving statistics
- `UPDATE_USER_STATUS_ERROR`: Error updating user status

## Usage Examples

### Get all mentors with pagination
```bash
GET /api/admin/users?role=MENTOR&page=1&limit=20
Authorization: Bearer <admin_token>
```

### Search users by name
```bash
GET /api/admin/users?search=john&page=1&limit=10
Authorization: Bearer <admin_token>
```

### Get completed appointments for a specific mentor
```bash
GET /api/admin/appointments?mentorId=mentor_123&status=COMPLETED&page=1&limit=10
Authorization: Bearer <admin_token>
```

### Get appointments in date range
```bash
GET /api/admin/appointments?dateFrom=2024-02-01&dateTo=2024-02-28&page=1&limit=50
Authorization: Bearer <admin_token>
```

## Testing

Use the provided test script to verify all endpoints:

```bash
# Make sure the backend server is running
npm run dev

# In another terminal, run the test script
node test-admin-apis.js
```

The test script will:
1. Login as admin user
2. Test all admin endpoints
3. Verify filtering and pagination
4. Test unauthorized access protection
5. Display comprehensive results

## Security Features

1. **Authentication Required**: All endpoints require valid JWT token
2. **Role-Based Authorization**: Only ADMIN role can access these endpoints
3. **Input Validation**: All query parameters and request bodies are validated
4. **Action Logging**: All admin actions are logged for audit purposes
5. **Rate Limiting**: Standard rate limiting applies to prevent abuse
6. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes