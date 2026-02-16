# School Management System API

A comprehensive RESTful API for managing schools, classrooms, and students with role-based access control.

## Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control (RBAC)** - Superadmin and School Administrator roles
- **Complete CRUD Operations** - For Schools, Classrooms, and Students
- **School-Scoped Access** - School administrators can only manage their assigned school
- **Rate Limiting** - Protection against abuse
- **Security Headers** - Helmet.js integration
- **Input Validation** - Comprehensive data validation
- **MongoDB Integration** - Optimized schema with proper relationships

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- **Redis (v6.0 or higher)** - Required by the Axion template
- npm or yarn

> **Note:** This API is built on the Axion template which requires Redis for caching and inter-process communication. See [QUICKSTART.md](./QUICKSTART.md) for detailed installation instructions for Redis and MongoDB on all platforms.

## Installation

**Quick Start:** See [QUICKSTART.md](./QUICKSTART.md) for step-by-step installation instructions including Redis and MongoDB setup.

1. Clone the repository:
```bash
git clone <repository-url>
cd school-management-api
```

2. Install dependencies:
```bash
npm install
```

3. **Start Redis and MongoDB** (required):
   - See [QUICKSTART.md](./QUICKSTART.md) for platform-specific instructions

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the following variables:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure secret key for JWT tokens
- `LONG_TOKEN_SECRET`, `SHORT_TOKEN_SECRET`, `NACL_SECRET` - Secure secret keys

4. Start MongoDB:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

5. Start the server:
```bash
npm start
```

The API will be available at `http://localhost:5111`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/user/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "superadmin"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "user": {
      "_id": "...",
      "username": "admin",
      "email": "admin@example.com",
      "role": "superadmin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/user/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

### School Endpoints (Superadmin Only)

All school endpoints require the `Authorization` header with a Bearer token from a superadmin user.

#### Create School
```http
POST /api/school/createSchool
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Springfield Elementary",
  "address": "123 Main St, Springfield",
  "contactEmail": "info@springfield.edu",
  "contactPhone": "+1234567890",
  "establishmentDate": "2000-01-01",
  "capacity": 500
}
```

#### Get All Schools
```http
GET /api/school/getSchools?page=1&limit=10&search=Springfield
Authorization: Bearer <token>
```

#### Get School by ID
```http
GET /api/school/getSchoolById?schoolId=<school_id>
Authorization: Bearer <token>
```

#### Update School
```http
PUT /api/school/updateSchool
Authorization: Bearer <token>
Content-Type: application/json

{
  "schoolId": "<school_id>",
  "name": "Updated School Name",
  "capacity": 600
}
```

#### Delete School
```http
DELETE /api/school/deleteSchool
Authorization: Bearer <token>
Content-Type: application/json

{
  "schoolId": "<school_id>"
}
```

### Classroom Endpoints (School Admin Only)

#### Create Classroom
```http
POST /api/classroom/createClassroom
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomNumber": "101",
  "capacity": 30,
  "resources": ["projector", "whiteboard"],
  "schoolId": "<school_id>"
}
```

#### Get Classrooms
```http
GET /api/classroom/getClassrooms?schoolId=<school_id>&page=1&limit=10
Authorization: Bearer <token>
```

#### Update Classroom
```http
PUT /api/classroom/updateClassroom
Authorization: Bearer <token>
Content-Type: application/json

{
  "classroomId": "<classroom_id>",
  "capacity": 35,
  "status": "available"
}
```

### Student Endpoints (School Admin Only)

#### Enroll Student
```http
POST /api/student/createStudent
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "dateOfBirth": "2010-05-15",
  "schoolId": "<school_id>",
  "classroomId": "<classroom_id>",
  "guardianName": "Jane Doe",
  "guardianPhone": "+1234567890"
}
```

#### Get Students
```http
GET /api/student/getStudents?schoolId=<school_id>&page=1&limit=10&search=John
Authorization: Bearer <token>
```

#### Transfer Student
```http
POST /api/student/transferStudent
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "<student_id>",
  "newSchoolId": "<new_school_id>",
  "newClassroomId": "<new_classroom_id>"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "ok": false,
  "message": "Error description",
  "code": 400
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP

## Testing

Run the test suite:
```bash
npm test
```

Run specific test suites:
```bash
npm run test:unit
npm run test:integration
npm run test:security
```

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Rate limiting
- Security headers (Helmet.js)
- Input validation and sanitization
- MongoDB injection prevention

## Database Schema

### Users
- username (unique)
- email (unique)
- password (hashed)
- role (superadmin | school_admin)
- schoolId (for school_admin)

### Schools
- name (unique)
- address
- contactEmail
- contactPhone
- establishmentDate
- capacity
- status (active | inactive)

### Classrooms
- roomNumber
- capacity
- resources (array)
- schoolId (reference to School)
- status (available | occupied | maintenance)

### Students
- firstName, lastName
- email (unique)
- dateOfBirth
- enrollmentStatus (active | transferred | graduated | withdrawn)
- schoolId (reference to School)
- classroomId (reference to Classroom)
- guardianName, guardianPhone

## License

ISC
