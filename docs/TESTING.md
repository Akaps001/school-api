# Testing Guide

## Prerequisites

Before running tests, ensure:
1. MongoDB is running
2. Dependencies are installed (`npm install`)
3. Environment variables are configured

## Running Tests

### All Tests with Coverage
```bash
npm test
```

This will run all tests and generate a coverage report in the `coverage/` directory.

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Security Tests Only
```bash
npm run test:security
```

## Manual Testing with Postman/Thunder Client

### 1. Setup

Import the following base URL:
```
http://localhost:5111
```

### 2. Authentication Flow

#### Step 1: Register a Superadmin
```http
POST /api/user/register
Content-Type: application/json

{
  "username": "superadmin",
  "email": "superadmin@test.com",
  "password": "password123",
  "role": "superadmin"
}
```7

Save the returned `token` for subsequent requests.

#### Step 2: Create a School
```http
POST /api/school/createSchool
Authorization: Bearer <superadmin_token>
Content-Type: application/json

{
  "name": "Test School",
  "address": "123 Test St",
  "contactEmail": "test@school.com",
  "contactPhone": "+1234567890",
  "establishmentDate": "2020-01-01",
  "capacity": 500
}
```

Save the returned `_id` as `school_id`.

#### Step 3: Register a School Admin
```http
POST /api/user/register
Content-Type: application/json

{
  "username": "schooladmin",
  "email": "admin@test.com",
  "password": "password123",
  "role": "school_admin",
  "schoolId": "<school_id>"
}
```

Save the returned `token` as `school_admin_token`.

### 3. Test School Admin Operations

#### Create a Classroom
```http
POST /api/classroom/createClassroom
Authorization: Bearer <school_admin_token>
Content-Type: application/json

{
  "roomNumber": "101",
  "capacity": 30,
  "resources": ["projector", "whiteboard"],
  "schoolId": "<school_id>"
}
```

#### Enroll a Student
```http
POST /api/student/createStudent
Authorization: Bearer <school_admin_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@test.com",
  "dateOfBirth": "2010-05-15",
  "schoolId": "<school_id>",
  "classroomId": "<classroom_id>",
  "guardianName": "Jane Doe",
  "guardianPhone": "+1234567890"
}
```

### 4. Test Authorization

#### Test 1: School Admin Cannot Create Schools
```http
POST /api/school/createSchool
Authorization: Bearer <school_admin_token>
Content-Type: application/json

{
  "name": "Another School",
  "address": "456 Test Ave",
  "contactEmail": "another@school.com",
  "contactPhone": "+0987654321",
  "establishmentDate": "2021-01-01",
  "capacity": 300
}
```

**Expected:** 403 Forbidden

#### Test 2: School Admin Cannot Access Other Schools
Create a second school as superadmin, then try to create a classroom for it as the first school admin.

**Expected:** 403 Forbidden

### 5. Test Rate Limiting

Make 6 rapid login requests with invalid credentials:

```http
POST /api/user/login
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "wrong"
}
```

**Expected:** After 5 requests, the 6th should return 429 Too Many Requests

### 6. Test Validation

#### Invalid Email
```http
POST /api/user/register
Content-Type: application/json

{
  "username": "test",
  "email": "invalid-email",
  "password": "password123",
  "role": "superadmin"
}
```

**Expected:** 400 Bad Request with validation errors

#### Short Password
```http
POST /api/user/register
Content-Type: application/json

{
  "username": "test2",
  "email": "test2@test.com",
  "password": "123",
  "role": "superadmin"
}
```

**Expected:** 400 Bad Request with password length error

### 7. Test Data Integrity

#### Duplicate Email
Try to register two users with the same email.

**Expected:** Second request returns error "Email already registered"

#### Duplicate Room Number in Same School
Try to create two classrooms with the same room number in the same school.

**Expected:** Second request returns error "Room number already exists in this school"

#### Delete Classroom with Students
1. Create a classroom
2. Enroll a student in that classroom
3. Try to delete the classroom

**Expected:** Error "Cannot delete classroom. X student(s) are currently assigned to this classroom."

## Load Testing

### Using Apache Bench

```bash
# Test school listing endpoint (replace token)
ab -n 1000 -c 10 -H "Authorization: Bearer <token>" http://localhost:5111/api/school/getSchools
```

### Using Artillery

Create `artillery-test.yml`:
```yaml
config:
  target: "http://localhost:5111"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Get Schools"
    flow:
      - get:
          url: "/api/school/getSchools"
          headers:
            Authorization: "Bearer <token>"
```

Run:
```bash
artillery run artillery-test.yml
```

## Expected Test Results

- All unit tests should pass
- All integration tests should pass
- Code coverage should be >80%
- Rate limiting should activate after threshold
- All authorization checks should prevent unauthorized access
- All validation should reject invalid input
