
module.exports = {
    createSchool: [
        {
            model: 'name',
            required: true,
            minLength: 3,
            maxLength: 200,
        },
        {
            model: 'address',
            required: true,
            maxLength: 500,
        },
        {
            model: 'contactEmail',
            required: true,
        },
        {
            model: 'contactPhone',
            required: true,
        },
        {
            model: 'establishmentDate',
            required: true,
        },
        {
            model: 'capacity',
            required: true,
            type: 'number',
        },
    ],
    updateSchool: [
        {
            model: 'schoolId',
            required: true,
        },
        {
            model: 'name',
            required: false,
            minLength: 3,
            maxLength: 200,
        },
        {
            model: 'address',
            required: false,
            maxLength: 500,
        },
        {
            model: 'contactEmail',
            required: false,
        },
        {
            model: 'contactPhone',
            required: false,
        },
        {
            model: 'capacity',
            required: false,
            type: 'number',
        },
        {
            model: 'status',
            required: false,
            enums: ['active', 'inactive'],
        },
    ],
}
