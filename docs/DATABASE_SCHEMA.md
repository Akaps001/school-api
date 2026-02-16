# Database Schema Diagram

The following diagram illustrates the MongoDB schema design and relationships for the School Management System API.

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String username
        +String email
        +String password
        +String role
        +ObjectId schoolId
        +Date createdAt
        +Date updatedAt
    }

    class School {
        +ObjectId _id
        +String name
        +String address
        +String contactEmail
        +String contactPhone
        +Date establishmentDate
        +Number capacity
        +String status
        +Date createdAt
        +Date updatedAt
    }

    class Classroom {
        +ObjectId _id
        +String roomNumber
        +Number capacity
        +String[] resources
        +ObjectId schoolId
        +String status
        +Date createdAt
        +Date updatedAt
    }

    class Student {
        +ObjectId _id
        +String firstName
        +String lastName
        +String email
        +Date dateOfBirth
        +String enrollmentStatus
        +ObjectId schoolId
        +ObjectId classroomId
        +String guardianName
        +String guardianPhone
        +Date createdAt
        +Date updatedAt
    }

    %% Relationships
    School "1" -- "many" Classroom : contains
    School "1" -- "many" Student : enrolls
    Classroom "1" -- "many" Student : assigned to
    School "1" -- "many" User : admins managed by
```

## Entity Descriptions

### User
Represents system users (Superadmins and School Administrators).
- **role**: Enum [`superadmin`, `school_admin`]
- **schoolId**: Reference to `School` (required only for `school_admin`)

### School
Represents a school entity.
- **name**: Unique identifier
- **status**: Enum [`active`, `inactive`]

### Classroom
Represents a physical classroom within a school.
- **schoolId**: Reference to the parent `School`
- **roomNumber**: Unique within a specific school

### Student
Represents a student enrolled in a school.
- **schoolId**: Reference to the `School` the student attends
- **classroomId**: Reference to the assigned `Classroom`
- **enrollmentStatus**: Enum [`active`, `transferred`, `graduated`, `withdrawn`]
