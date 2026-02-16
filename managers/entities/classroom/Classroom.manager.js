module.exports = class Classroom {

    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.httpExposed = [
            'post=createClassroom',
            'get=getClassrooms',
            'get=getClassroomById',
            'put=updateClassroom',
            'delete=deleteClassroom'
        ];
    }

    /**
     * Create a new classroom (School Admin only)
     */
    async createClassroom({ __auth, __schoolAdmin, roomNumber, capacity, resources, schoolId }) {
        const classroomData = { roomNumber, capacity, resources, schoolId };

        // Data validation
        let validationErrors = await this.validators.classroom.createClassroom(classroomData);
        if (validationErrors) {
            return { errors: validationErrors };
        }

        try {
            // Verify admin has access to this school
            if (__schoolAdmin.schoolId !== schoolId) {
                return { error: 'Access denied. You can only create classrooms for your assigned school.', code: 403 };
            }

            const Classroom = this.mongomodels.Classroom;
            const School = this.mongomodels.School;

            // Verify school exists and is active
            const school = await School.findById(schoolId);
            if (!school) {
                return { error: 'School not found', code: 404 };
            }
            if (school.status !== 'active') {
                return { error: 'Cannot create classroom for inactive school' };
            }

            // Check if room number already exists in this school
            const existingClassroom = await Classroom.findOne({ schoolId, roomNumber });
            if (existingClassroom) {
                return { error: 'Room number already exists in this school' };
            }

            // Create classroom
            const newClassroom = new Classroom({
                roomNumber,
                capacity,
                resources: resources || [],
                schoolId
            });

            const savedClassroom = await newClassroom.save();

            return savedClassroom.toJSON();

        } catch (error) {
            console.error('Create classroom error:', error);

            if (error.code === 11000) {
                return { error: 'Room number already exists in this school' };
            }

            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return { errors: messages };
            }

            return { error: 'Failed to create classroom. Please try again.' };
        }
    }

    /**
     * Get classrooms (School Admin - filtered by their school)
     */
    async getClassrooms({ __auth, __schoolAdmin, schoolId, page = 1, limit = 10 }) {
        try {
            // Use admin's schoolId if not provided, or verify access
            const targetSchoolId = schoolId || __schoolAdmin.schoolId;

            if (__schoolAdmin.schoolId !== targetSchoolId) {
                return { error: 'Access denied. You can only view classrooms from your assigned school.', code: 403 };
            }

            const Classroom = this.mongomodels.Classroom;

            // Build query
            const query = { schoolId: targetSchoolId };

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Execute query
            const classrooms = await Classroom.find(query)
                .sort({ roomNumber: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('schoolId', 'name');

            const total = await Classroom.countDocuments(query);

            return {
                classrooms,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };

        } catch (error) {
            console.error('Get classrooms error:', error);
            return { error: 'Failed to fetch classrooms. Please try again.' };
        }
    }

    /**
     * Get classroom by ID (School Admin - must belong to their school)
     */
    async getClassroomById({ __auth, __schoolAdmin, classroomId }) {
        try {
            const Classroom = this.mongomodels.Classroom;

            const classroom = await Classroom.findById(classroomId).populate('schoolId', 'name');

            if (!classroom) {
                return { error: 'Classroom not found', code: 404 };
            }

            // Verify admin has access to this classroom's school
            if (classroom.schoolId._id.toString() !== __schoolAdmin.schoolId) {
                return { error: 'Access denied. This classroom belongs to a different school.', code: 403 };
            }

            return classroom.toJSON();

        } catch (error) {
            console.error('Get classroom by ID error:', error);

            if (error.name === 'CastError') {
                return { error: 'Invalid classroom ID', code: 400 };
            }

            return { error: 'Failed to fetch classroom. Please try again.' };
        }
    }

    /**
     * Update classroom (School Admin - must belong to their school)
     */
    async updateClassroom({ __auth, __schoolAdmin, classroomId, roomNumber, capacity, resources, status }) {
        const updateData = { classroomId, roomNumber, capacity, resources, status };

        // Data validation
        let validationErrors = await this.validators.classroom.updateClassroom(updateData);
        if (validationErrors) {
            return { errors: validationErrors };
        }

        try {
            const Classroom = this.mongomodels.Classroom;

            // Find classroom
            const classroom = await Classroom.findById(classroomId);
            if (!classroom) {
                return { error: 'Classroom not found', code: 404 };
            }

            // Verify admin has access to this classroom's school
            if (classroom.schoolId.toString() !== __schoolAdmin.schoolId) {
                return { error: 'Access denied. This classroom belongs to a different school.', code: 403 };
            }

            // Check if new room number conflicts with existing classroom
            if (roomNumber && roomNumber !== classroom.roomNumber) {
                const existingClassroom = await Classroom.findOne({
                    schoolId: classroom.schoolId,
                    roomNumber
                });
                if (existingClassroom) {
                    return { error: 'Room number already exists in this school' };
                }
            }

            // Update fields
            if (roomNumber) classroom.roomNumber = roomNumber;
            if (capacity) classroom.capacity = capacity;
            if (resources) classroom.resources = resources;
            if (status) classroom.status = status;

            const updatedClassroom = await classroom.save();

            return updatedClassroom.toJSON();

        } catch (error) {
            console.error('Update classroom error:', error);

            if (error.name === 'CastError') {
                return { error: 'Invalid classroom ID', code: 400 };
            }

            if (error.code === 11000) {
                return { error: 'Room number already exists in this school' };
            }

            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return { errors: messages };
            }

            return { error: 'Failed to update classroom. Please try again.' };
        }
    }

    /**
     * Delete classroom (School Admin - must belong to their school)
     */
    async deleteClassroom({ __auth, __schoolAdmin, classroomId }) {
        try {
            const Classroom = this.mongomodels.Classroom;
            const Student = this.mongomodels.Student;

            const classroom = await Classroom.findById(classroomId);

            if (!classroom) {
                return { error: 'Classroom not found', code: 404 };
            }

            // Verify admin has access to this classroom's school
            if (classroom.schoolId.toString() !== __schoolAdmin.schoolId) {
                return { error: 'Access denied. This classroom belongs to a different school.', code: 403 };
            }

            // Check if classroom has assigned students
            const studentsCount = await Student.countDocuments({ classroomId });
            if (studentsCount > 0) {
                return { error: `Cannot delete classroom. ${studentsCount} student(s) are currently assigned to this classroom.` };
            }

            // Delete classroom
            await classroom.deleteOne();

            return { message: 'Classroom deleted successfully' };

        } catch (error) {
            console.error('Delete classroom error:', error);

            if (error.name === 'CastError') {
                return { error: 'Invalid classroom ID', code: 400 };
            }

            return { error: 'Failed to delete classroom. Please try again.' };
        }
    }

}
