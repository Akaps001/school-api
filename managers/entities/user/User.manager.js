const jwt = require('jsonwebtoken');

module.exports = class User {

    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.usersCollection = "users";
        this.httpExposed = ['register', 'login'];
    }

    /**
     * Register a new user
     * Creates user with hashed password and returns JWT token
     */
    async register({ username, email, password, role, schoolId }) {
        const userData = { username, email, password, role, schoolId };

        // Data validation
        let validationErrors = await this.validators.user.register(userData);
        if (validationErrors) {
            return { errors: validationErrors };
        }

        try {
            // Additional validation: schoolId required for school_admin
            if (role === 'school_admin' && !schoolId) {
                return { error: 'School ID is required for school administrators' };
            }

            // Additional validation: schoolId should not be provided for superadmin
            if (role === 'superadmin' && schoolId) {
                return { error: 'Superadmin should not be assigned to a specific school' };
            }

            // Check if school exists (if schoolId provided)
            if (schoolId) {
                const School = this.mongomodels.School;
                const school = await School.findById(schoolId);
                if (!school) {
                    return { error: 'School not found' };
                }
                if (school.status !== 'active') {
                    return { error: 'Cannot assign user to inactive school' };
                }
            }

            // Check if user already exists
            const UserModel = this.mongomodels.User;
            const existingUser = await UserModel.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                if (existingUser.email === email) {
                    return { error: 'Email already registered' };
                }
                if (existingUser.username === username) {
                    return { error: 'Username already taken' };
                }
            }

            // Create user (password will be hashed by pre-save hook)
            const newUser = new UserModel({
                username,
                email,
                password,
                role,
                schoolId: role === 'school_admin' ? schoolId : undefined
            });

            const savedUser = await newUser.save();

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: savedUser._id.toString(),
                    email: savedUser.email,
                    role: savedUser.role,
                    schoolId: savedUser.schoolId ? savedUser.schoolId.toString() : null,
                },
                this.config.dotEnv.JWT_SECRET,
                { expiresIn: this.config.dotEnv.JWT_EXPIRES_IN }
            );

            // Response (password excluded by toJSON method)
            return {
                user: savedUser.toJSON(),
                token
            };

        } catch (error) {
            console.error('Registration error:', error);

            // Handle MongoDB duplicate key errors
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                return { error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` };
            }

            // Handle validation errors
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return { errors: messages };
            }

            return { error: 'Registration failed. Please try again.' };
        }
    }

    /**
     * Login user
     * Validates credentials and returns JWT token
     */
    async login({ email, password }) {
        const credentials = { email, password };

        // Data validation
        let validationErrors = await this.validators.user.login(credentials);
        if (validationErrors) {
            return { errors: validationErrors };
        }

        try {
            const UserModel = this.mongomodels.User;

            // Find user by email
            const user = await UserModel.findOne({ email }).select('+password');

            if (!user) {
                return { error: 'Invalid email or password' };
            }

            // Check if user is active
            if (!user.isActive) {
                return { error: 'Account is deactivated. Please contact administrator.' };
            }

            // Compare password
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return { error: 'Invalid email or password' };
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    schoolId: user.schoolId ? user.schoolId.toString() : null,
                },
                this.config.dotEnv.JWT_SECRET,
                { expiresIn: this.config.dotEnv.JWT_EXPIRES_IN }
            );

            // Response (password excluded by toJSON method)
            return {
                user: user.toJSON(),
                token
            };

        } catch (error) {
            console.error('Login error:', error);
            return { error: 'Login failed. Please try again.' };
        }
    }

}
