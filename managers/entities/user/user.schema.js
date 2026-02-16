
module.exports = {
    register: [
        {
            model: 'username',
            required: true,
        },
        {
            model: 'email',
            required: true,
        },
        {
            model: 'password',
            required: true,
            minLength: 8,
        },
        {
            model: 'role',
            required: true,
            enum: ['superadmin', 'school_admin'],
        },
        {
            model: 'schoolId',
            required: false,
        },
    ],
    login: [
        {
            model: 'email',
            required: true,
        },
        {
            model: 'password',
            required: true,
        },
    ],
}

