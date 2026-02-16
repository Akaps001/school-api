
module.exports = {
    createStudent: [
        {
            model: 'firstName',
            required: true,
            minLength: 2,
            maxLength: 100,
        },
        {
            model: 'lastName',
            required: true,
            minLength: 2,
            maxLength: 100,
        },
        {
            model: 'email',
            required: true,
        },
        {
            model: 'dateOfBirth',
            required: true,
        },
        {
            model: 'schoolId',
            required: true,
        },
        {
            model: 'classroomId',
            required: false,
        },
        {
            model: 'guardianName',
            required: true,
            minLength: 3,
            maxLength: 200,
        },
        {
            model: 'guardianPhone',
            required: true,
        },
    ],
    updateStudent: [
        {
            model: 'studentId',
            required: true,
        },
        {
            model: 'firstName',
            required: false,
            minLength: 2,
            maxLength: 100,
        },
        {
            model: 'lastName',
            required: false,
            minLength: 2,
            maxLength: 100,
        },
        {
            model: 'email',
            required: false,
        },
        {
            model: 'dateOfBirth',
            required: false,
        },
        {
            model: 'classroomId',
            required: false,
        },
        {
            model: 'guardianName',
            required: false,
            minLength: 3,
            maxLength: 200,
        },
        {
            model: 'guardianPhone',
            required: false,
        },
        {
            model: 'enrollmentStatus',
            required: false,
            enums: ['active', 'transferred', 'graduated', 'withdrawn'],
        },
    ],
    transferStudent: [
        {
            model: 'studentId',
            required: true,
        },
        {
            model: 'newSchoolId',
            required: true,
        },
        {
            model: 'newClassroomId',
            required: false,
        },
    ],
}
