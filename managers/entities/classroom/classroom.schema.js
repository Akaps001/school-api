
module.exports = {
    createClassroom: [
        {
            model: 'roomNumber',
            required: true,
            maxLength: 50,
        },
        {
            model: 'capacity',
            required: true,
            type: 'number',
        },
        {
            model: 'resources',
            required: false,
            type: 'array',
        },
        {
            model: 'schoolId',
            required: true,
        },
    ],
    updateClassroom: [
        {
            model: 'classroomId',
            required: true,
        },
        {
            model: 'roomNumber',
            required: false,
            maxLength: 50,
        },
        {
            model: 'capacity',
            required: false,
            type: 'number',
        },
        {
            model: 'resources',
            required: false,
            type: 'array',
        },
        {
            model: 'status',
            required: false,
            enums: ['available', 'occupied', 'maintenance'],
        },
    ],
}
