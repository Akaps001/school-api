const emojis = require('../../public/emojis.data.json');

module.exports = {
    id: {
        path: "id",
        type: "string",
        length: { min: 1, max: 50 },
    },
    username: {
        path: 'username',
        type: 'string',
        length: { min: 3, max: 20 },
        custom: 'username',
    },
    password: {
        path: 'password',
        type: 'string',
        length: { min: 8, max: 100 },
    },
    email: {
        path: 'email',
        type: 'string',
        length: { min: 3, max: 100 },
    },
    role: {
        path: 'role',
        type: 'string',
        enum: ['superadmin', 'school_admin'],
    },
    schoolId: {
        path: 'schoolId',
        type: 'string',
        length: { min: 1, max: 50 },
    },
    title: {
        path: 'title',
        type: 'string',
        length: { min: 3, max: 300 }
    },
    label: {
        path: 'label',
        type: 'string',
        length: { min: 3, max: 100 }
    },
    shortDesc: {
        path: 'desc',
        type: 'string',
        length: { min: 3, max: 300 }
    },
    longDesc: {
        path: 'desc',
        type: 'string',
        length: { min: 3, max: 2000 }
    },
    url: {
        path: 'url',
        type: 'string',
        length: { min: 9, max: 300 },
    },
    emoji: {
        path: 'emoji',
        type: 'Array',
        items: {
            type: 'string',
            length: { min: 1, max: 10 },
            oneOf: emojis.value,
        }
    },
    price: {
        path: 'price',
        type: 'number',
    },
    avatar: {
        path: 'avatar',
        type: 'string',
        length: { min: 8, max: 100 },
    },
    text: {
        type: 'String',
        length: { min: 3, max: 15 },
    },
    longText: {
        type: 'String',
        length: { min: 3, max: 250 },
    },
    paragraph: {
        type: 'String',
        length: { min: 3, max: 10000 },
    },
    phone: {
        type: 'String',
        length: 13,
    },
    number: {
        type: 'Number',
        length: { min: 1, max: 6 },
    },
    arrayOfStrings: {
        type: 'Array',
        items: {
            type: 'String',
            length: { min: 3, max: 100 }
        }
    },
    obj: {
        type: 'Object',
    },
    bool: {
        type: 'Boolean',
    },
    name: {
        path: 'name',
        type: 'string',
        length: { min: 3, max: 100 },
    },
    address: {
        path: 'address',
        type: 'string',
        length: { min: 3, max: 500 },
    },
    contactEmail: {
        path: 'contactEmail',
        type: 'string',
        length: { min: 3, max: 100 },
    },
    contactPhone: {
        path: 'contactPhone',
        type: 'string',
        length: { min: 3, max: 20 },
    },
    establishmentDate: {
        path: 'establishmentDate',
        type: 'string',
    },
    capacity: {
        path: 'capacity',
        type: 'number',
    },
    status: {
        path: 'status',
        type: 'string',
        enum: ['active', 'inactive'],
    },
    roomNumber: {
        path: 'roomNumber',
        type: 'string',
        length: { min: 1, max: 50 },
    },
    resources: {
        path: 'resources',
        type: 'Array',
        items: {
            type: 'string',
            length: { min: 1, max: 100 },
        }
    },
    classroomId: {
        path: 'classroomId',
        type: 'string',
        length: { min: 1, max: 50 },
    },
    firstName: {
        path: 'firstName',
        type: 'string',
        length: { min: 1, max: 100 },
    },
    lastName: {
        path: 'lastName',
        type: 'string',
        length: { min: 1, max: 100 },
    },
    dateOfBirth: {
        path: 'dateOfBirth',
        type: 'string',
    },
    guardianName: {
        path: 'guardianName',
        type: 'string',
        length: { min: 1, max: 100 },
    },
    guardianPhone: {
        path: 'guardianPhone',
        type: 'string',
        length: { min: 1, max: 20 },
    },
    enrollmentStatus: {
        path: 'enrollmentStatus',
        type: 'string',
        enum: ['active', 'transferred', 'graduated', 'withdrawn'],
    },
    studentId: {
        path: 'studentId',
        type: 'string',
        length: { min: 1, max: 50 },
    },
    newSchoolId: {
        path: 'newSchoolId',
        type: 'string',
        length: { min: 1, max: 50 },
    },
    newClassroomId: {
        path: 'newClassroomId',
        type: 'string',
        length: { min: 1, max: 50 },
    }
}