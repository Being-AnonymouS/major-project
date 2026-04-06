# Authentication System Implementation

## Overview

This authentication system provides secure user registration, login, and authorization for the Mentor Connect platform.

## Components Implemented

### 1. JWT Token Utilities (`utils/jwt.ts`)

- Token generation with user payload
- Token verification and decoding
- Token extraction from Authorization headers
- Configurable expiration (7 days default)

### 2. Password Security (`utils/password.ts`)

- Secure password hashing using bcrypt (12 salt rounds)
- Password comparison for login
- Password strength validation with requirements:
  - Minimum 8 characters
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number
  - At least one special character (@$!%\*?&)

### 3. Authentication Middleware (`middleware/auth.ts`)

- `authenticateToken`: Validates JWT tokens and adds user to request
- `authorizeRoles`: Role-based access control
- Convenience middlewares: `requireMentor`, `requireMentee`, `requireAdmin`
- Database verification of user existence

### 4. Input Validation (`middleware/validation.ts`)

- Registration input validation and sanitization
- Login input validation
- XSS protection through input sanitization
- Comprehensive error reporting

### 5. Authentication Service (`services/authService.ts`)

- User registration with role-based signup
- User login with credential validation
- User retrieval by ID
- Proper error handling and validation

### 6. Authentication Controller (`controllers/authController.ts`)

- Registration endpoint handler
- Login endpoint handler
- Current user info endpoint
- Logout endpoint (client-side token removal)

### 7. Authentication Routes (`routes/authRoutes.ts`)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user

## API Endpoints

### Register User

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "MENTOR" | "MENTEE" | "ADMIN"
}
```

### Login User

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Get Current User

```
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### Logout

```
POST /api/auth/logout
```

## Security Features

1. **Password Security**: Bcrypt hashing with 12 salt rounds
2. **JWT Security**: Signed tokens with configurable expiration
3. **Input Validation**: Comprehensive validation and sanitization
4. **Role-Based Access**: Middleware for role authorization
5. **Database Verification**: Token validation includes user existence check
6. **XSS Protection**: Input sanitization removes malicious content

## Environment Variables Required

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

## Usage in Protected Routes

```typescript
import { authenticateToken, requireMentor } from '../middleware/auth';

// Protect any route
router.get('/protected', authenticateToken, handler);

// Require specific role
router.get('/mentor-only', authenticateToken, requireMentor, handler);

// Access user info in handler
const handler = (req: Request, res: Response) => {
  const userId = req.user?.userId; // Available after authenticateToken
  const userRole = req.user?.role;
  // ... handler logic
};
```

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": ["Additional error details if applicable"]
  }
}
```

## Success Responses

Authentication endpoints return:

```json
{
  "success": true,
  "data": {
    "user": {
      /* user object without password */
    },
    "token": "jwt_token_string"
  },
  "message": "Success message"
}
```
