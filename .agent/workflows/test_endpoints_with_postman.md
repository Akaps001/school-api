---
description: Test API Endpoints with Postman
---

# Test API Endpoints with Postman

This workflow guides you through manually testing the School Management API endpoints using Postman.

## Pre-requisites
1.  **Start the Server**: Ensure the API server is running.
    ```bash
    npm start
    ```
    The server should be running on `http://localhost:5120` (as per your log output) or `http://localhost:5111` (check your `.env` file). The logs showed port **5120**.

2.  **Postman Installed**: Ensure you have Postman or a similar API client installed.

## Testing Steps

### 1. Configure Collection Variable
Create a collection in Postman and set a variable `{{baseUrl}}` to `http://localhost:5120` (or your configured port).

### 2. Authentication (Superadmin)
**Register Superadmin**
-   **Method**: POST
-   **URL**: `{{baseUrl}}/api/user/register`
-   **Body** (JSON):
    ```json
    {
      "username": "superadmin",
      "email": "superadmin@test.com",
      "password": "password123",
      "role": "superadmin"
    }
    ```
-   **Action**: Send request.
-   **Save**: Copy the `token` from the response.

### 3. Create a School
**Create School**
-   **Method**: POST
-   **URL**: `{{baseUrl}}/api/school/createSchool`
-   **Headers**:
    -   `Authorization`: `Bearer <superadmin_token>`
-   **Body** (JSON):
    ```json
    {
      "name": "Test School",
      "address": "123 Test St",
      "contactEmail": "test@school.com",
      "contactPhone": "+1234567890",
      "establishmentDate": "2020-01-01",
      "capacity": 500
    }
    ```
-   **Action**: Send request.
-   **Save**: Copy the `_id` from the response (this is the `schoolId`).

### 4. Authentication (School Admin)
**Register School Admin**
-   **Method**: POST
-   **URL**: `{{baseUrl}}/api/user/register`
-   **Body** (JSON):
    ```json
    {
      "username": "schooladmin",
      "email": "admin@test.com",
      "password": "password123",
      "role": "school_admin",
      "schoolId": "<schoolId>"
    }
    ```
-   **Action**: Send request.
-   **Save**: Copy the `token` from the response (`school_admin_token`).

### 5. Create Classroom
-   **Method**: POST
-   **URL**: `{{baseUrl}}/api/classroom/createClassroom`
-   **Headers**:
    -   `Authorization`: `Bearer <school_admin_token>`
-   **Body** (JSON):
    ```json
    {
      "roomNumber": "101",
      "capacity": 30,
      "resources": ["projector", "whiteboard"],
      "schoolId": "<schoolId>"
    }
    ```

### 6. Create Student
-   **Method**: POST
-   **URL**: `{{baseUrl}}/api/student/createStudent`
-   **Headers**:
    -   `Authorization`: `Bearer <school_admin_token>`
-   **Body** (JSON):
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@test.com",
      "dateOfBirth": "2010-05-15",
      "schoolId": "<schoolId>",
      "classroomId": "<classroomId>",
      "guardianName": "Jane Doe",
      "guardianPhone": "+1234567890"
    }
    ```
