module.exports = class School {

    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.httpExposed = [
            'post=createSchool',
            'get=getSchools',
            'get=getSchoolById',
            'put=updateSchool',
            'delete=deleteSchool'
        ];
    }

    /**
     * Create a new school (Superadmin only)
     */
    async createSchool({ __auth, __superadmin, name, address, contactEmail, contactPhone, establishmentDate, capacity }) {
        const schoolData = { name, address, contactEmail, contactPhone, establishmentDate, capacity };

        // Data validation
        let validationErrors = await this.validators.school.createSchool(schoolData);
        if (validationErrors) {
            return { errors: validationErrors };
        }

        try {
            const School = this.mongomodels.School;

            // Check if school name already exists
            const existingSchool = await School.findOne({ name });
            if (existingSchool) {
                return { error: 'School with this name already exists' };
            }

            // Create school
            const newSchool = new School({
                name,
                address,
                contactEmail,
                contactPhone,
                establishmentDate: new Date(establishmentDate),
                capacity
            });

            const savedSchool = await newSchool.save();

            return savedSchool.toJSON();

        } catch (error) {
            console.error('Create school error:', error);

            if (error.code === 11000) {
                return { error: 'School with this name already exists' };
            }

            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return { errors: messages };
            }

            return { error: 'Failed to create school. Please try again.' };
        }
    }

    /**
     * Get all schools with pagination and search (Superadmin only)
     */
    async getSchools({ __auth, __superadmin, page = 1, limit = 10, search = '' }) {
        try {
            const School = this.mongomodels.School;

            // Build query
            const query = {};
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { address: { $regex: search, $options: 'i' } }
                ];
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Execute query
            const schools = await School.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await School.countDocuments(query);

            return {
                schools,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };

        } catch (error) {
            console.error('Get schools error:', error);
            return { error: 'Failed to fetch schools. Please try again.' };
        }
    }

    /**
     * Get school by ID (Superadmin only)
     */
    async getSchoolById({ __auth, __superadmin, schoolId }) {
        try {
            const School = this.mongomodels.School;

            const school = await School.findById(schoolId);

            if (!school) {
                return { error: 'School not found', code: 404 };
            }

            return school.toJSON();

        } catch (error) {
            console.error('Get school by ID error:', error);

            if (error.name === 'CastError') {
                return { error: 'Invalid school ID', code: 400 };
            }

            return { error: 'Failed to fetch school. Please try again.' };
        }
    }

    /**
     * Update school (Superadmin only)
     */
    async updateSchool({ __auth, __superadmin, schoolId, name, address, contactEmail, contactPhone, capacity, status }) {
        const updateData = { schoolId, name, address, contactEmail, contactPhone, capacity, status };

        // Data validation
        let validationErrors = await this.validators.school.updateSchool(updateData);
        if (validationErrors) {
            return { errors: validationErrors };
        }

        try {
            const School = this.mongomodels.School;

            // Find school
            const school = await School.findById(schoolId);
            if (!school) {
                return { error: 'School not found', code: 404 };
            }

            // Check if new name conflicts with existing school
            if (name && name !== school.name) {
                const existingSchool = await School.findOne({ name });
                if (existingSchool) {
                    return { error: 'School with this name already exists' };
                }
            }

            // Update fields
            if (name) school.name = name;
            if (address) school.address = address;
            if (contactEmail) school.contactEmail = contactEmail;
            if (contactPhone) school.contactPhone = contactPhone;
            if (capacity) school.capacity = capacity;
            if (status) school.status = status;

            const updatedSchool = await school.save();

            return updatedSchool.toJSON();

        } catch (error) {
            console.error('Update school error:', error);

            if (error.name === 'CastError') {
                return { error: 'Invalid school ID', code: 400 };
            }

            if (error.code === 11000) {
                return { error: 'School with this name already exists' };
            }

            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return { errors: messages };
            }

            return { error: 'Failed to update school. Please try again.' };
        }
    }

    /**
     * Delete school (soft delete - set status to inactive) (Superadmin only)
     */
    async deleteSchool({ __auth, __superadmin, schoolId }) {
        try {
            const School = this.mongomodels.School;

            const school = await School.findById(schoolId);

            if (!school) {
                return { error: 'School not found', code: 404 };
            }

            // Soft delete - set status to inactive
            school.status = 'inactive';
            await school.save();

            return { message: 'School deleted successfully' };

        } catch (error) {
            console.error('Delete school error:', error);

            if (error.name === 'CastError') {
                return { error: 'Invalid school ID', code: 400 };
            }

            return { error: 'Failed to delete school. Please try again.' };
        }
    }

}
