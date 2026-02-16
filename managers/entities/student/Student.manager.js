module.exports = class Student {

    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.httpExposed = [
            'post=createStudent',
            'get=getStudents',
            'get=getStudentById',
            'put=updateStudent',
            'post=transferStudent',
            'delete=deleteStudent'
        ];
    }

    /**
     * Create a new student (School Admin only)
     */
    async createStudent({ __auth, __schoolAdmin, firstName, lastName, email, dateOfBirth, schoolId, classroomId, guardianName, guardianPhone }) {
        const studentData = { firstName, lastName, email, dateOfBirth, schoolId, classroomId, guardianName, guardianPhone };

        // Data validation
        let validationErrors = await this.validators.student.createStudent(studentData);
        if (validationErrors) {
            return { errors: validationErrors };
        }

        try {
            // Verify admin has access to this school
            if (__schoolAdmin.schoolId !== schoolId) {
                return { error: 'Access denied. You can only enroll students in your assigned school.', code: 403 };
            }

            const Student = this.mongomodels.Student;
            const School = this.mongomodels.School;
            const Classroom = this.mongomodels.Classroom;

            // Verify school exists and is active
            const school = await School.findById(schoolId);
            if (!school) {
                return { error: 'School not found', code: 404 };
            }
            if (school.status !== 'active') {
                return { error: 'Cannot enroll student in inactive school' };
            }

            // Verify classroom belongs to the same school (if provided)
            if (classroomId) {
                const classroom = await Classroom.findById(classroomId);
                if (!classroom) {
                    return { error: 'Classroom not found', code: 404 };
                }
                if (classroom.schoolId.toString() !== schoolId) {
                    return { error: 'Classroom does not belong to the specified school' };
                }
            }

            // Check if email already exists
            const existingStudent = await Student.findOne({ email });
            if (existingStudent) {
                return { error: 'Student with this email already exists' };
            }

            // Create student
            const newStudent = new Student({
                firstName,
                lastName,
                email,
                dateOfBirth: new Date(dateOfBirth),
                schoolId,
                classroomId: classroomId || null,
                guardianName,
                guardianPhone,
                enrollmentStatus: 'active',
                enrollmentDate: new Date()
            });

            const savedStudent = await newStudent.save();

            return savedStudent.toJSON();

        } catch (error) {
            console.error('Create student error:', error);

            if (error.code === 11000) {
                return { error: 'Student with this email already exists' };
            }

            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return { errors: messages };
            }

            return { error: 'Failed to enroll student. Please try again.' };
        }
    }

    /**
     * Get students (School Admin - filtered by their school)
     */
    async getStudents({ __auth, __schoolAdmin, schoolId, classroomId, enrollmentStatus, page = 1, limit = 10, search = '' }) {
        try {
            // Use admin's schoolId if not provided, or verify access
            const targetSchoolId = schoolId || __schoolAdmin.schoolId;

            if (__schoolAdmin.schoolId !== targetSchoolId) {
                return { error: 'Access denied. You can only view students from your assigned school.', code: 403 };
            }

            const Student = this.mongomodels.Student;

            // Build query
            const query = { schoolId: targetSchoolId };

            if (classroomId) {
                query.classroomId = classroomId;
            }

            if (enrollmentStatus) {
                query.enrollmentStatus = enrollmentStatus;
            }

            if (search) {
                query.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Execute query
            const students = await Student.find(query)
                .sort({ lastName: 1, firstName: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('schoolId', 'name')
                .populate('classroomId', 'roomNumber');

            const total = await Student.countDocuments(query);

            return {
                students,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            };

        } catch (error) {
            console.error('Get students error:', error);
            return { error: 'Failed to fetch students. Please try again.' };
        }
    }

    /**
     * Get student by ID (School Admin - must belong to their school)
     */
    async getStudentById({ __auth, __schoolAdmin, studentId }) {
        try {
            const Student = this.mongomodels.Student;

            const student = await Student.findById(studentId)
                .populate('schoolId', 'name address contactEmail contactPhone')
                .populate('classroomId', 'roomNumber capacity');

            if (!student) {
                return { error: 'Student not found', code: 404 };
            }

            // Verify admin has access to this student's school
            if (student.schoolId._id.toString() !== __schoolAdmin.schoolId) {
                return { error: 'Access denied. This student belongs to a different school.', code: 403 };
            }

            return student.toJSON();

        } catch (error) {
            console.error('Get student by ID error:', error);

            if (error.name === 'CastError') {
                return { error: 'Invalid student ID', code: 400 };
            }

            return { error: 'Failed to fetch student. Please try again.' };
        }
    }

    /**
     * Update student (School Admin - must belong to their school)
     */
    async updateStudent({ __auth, __schoolAdmin, studentId, firstName, lastName, email, dateOfBirth, guardianName, guardianPhone, classroomId, enrollmentStatus }) {
        const updateData = { studentId, firstName, lastName, email, dateOfBirth, guardianName, guardianPhone, classroomId, enrollmentStatus };

        // Data validation
        let validationErrors = await this.validators.student.updateStudent(updateData);
        if (validationErrors) {
            return { errors: validationErrors };
        }

        try {
            const Student = this.mongomodels.Student;
            const Classroom = this.mongomodels.Classroom;

            // Find student
            const student = await Student.findById(studentId);
            if (!student) {
                return { error: 'Student not found', code: 404 };
            }

            // Verify admin has access to this student's school
            if (student.schoolId.toString() !== __schoolAdmin.schoolId) {
                return { error: 'Access denied. This student belongs to a different school.', code: 403 };
            }

            // Verify classroom belongs to the same school (if provided)
            if (classroomId) {
                const classroom = await Classroom.findById(classroomId);
                if (!classroom) {
                    return { error: 'Classroom not found', code: 404 };
                }
                if (classroom.schoolId.toString() !== student.schoolId.toString()) {
                    return { error: 'Classroom does not belong to the student\'s school' };
                }
            }

            // Check if new email conflicts with existing student
            if (email && email !== student.email) {
                const existingStudent = await Student.findOne({ email });
                if (existingStudent) {
                    return { error: 'Student with this email already exists' };
                }
            }

            // Update fields
            if (firstName) student.firstName = firstName;
            if (lastName) student.lastName = lastName;
            if (email) student.email = email;
            if (dateOfBirth) student.dateOfBirth = new Date(dateOfBirth);
            if (guardianName) student.guardianName = guardianName;
            if (guardianPhone) student.guardianPhone = guardianPhone;
            if (classroomId !== undefined) student.classroomId = classroomId || null;
            if (enrollmentStatus) student.enrollmentStatus = enrollmentStatus;

            const updatedStudent = await student.save();

            return updatedStudent.toJSON();

        } catch (error) {
            console.error('Update student error:', error);

            if (error.name === 'CastError') {
                return { error: 'Invalid student or classroom ID', code: 400 };
            }

            if (error.code === 11000) {
                return { error: 'Student with this email already exists' };
            }

            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return { errors: messages };
            }

            return { error: 'Failed to update student. Please try again.' };
        }
    }

    /**
     * Transfer student to another school (School Admin - must currently belong to their school)
     */
    async transferStudent({ __auth, __schoolAdmin, studentId, newSchoolId, newClassroomId }) {
        const transferData = { studentId, newSchoolId, newClassroomId };

        // Data validation
        let validationErrors = await this.validators.student.transferStudent(transferData);
        if (validationErrors) {
            return { errors: validationErrors };
        }

        try {
            const Student = this.mongomodels.Student;
            const School = this.mongomodels.School;
            const Classroom = this.mongomodels.Classroom;

            // Find student
            const student = await Student.findById(studentId);
            if (!student) {
                return { error: 'Student not found', code: 404 };
            }

            // Verify admin has access to current student's school
            if (student.schoolId.toString() !== __schoolAdmin.schoolId) {
                return { error: 'Access denied. This student belongs to a different school.', code: 403 };
            }

            // Verify new school exists and is active
            const newSchool = await School.findById(newSchoolId);
            if (!newSchool) {
                return { error: 'New school not found', code: 404 };
            }
            if (newSchool.status !== 'active') {
                return { error: 'Cannot transfer student to inactive school' };
            }

            // Verify new classroom belongs to new school (if provided)
            if (newClassroomId) {
                const newClassroom = await Classroom.findById(newClassroomId);
                if (!newClassroom) {
                    return { error: 'New classroom not found', code: 404 };
                }
                if (newClassroom.schoolId.toString() !== newSchoolId) {
                    return { error: 'Classroom does not belong to the new school' };
                }
            }

            // Update student
            student.schoolId = newSchoolId;
            student.classroomId = newClassroomId || null;
            student.enrollmentStatus = 'transferred';

            const updatedStudent = await student.save();

            return updatedStudent.toJSON();

        } catch (error) {
            console.error('Transfer student error:', error);

            if (error.name === 'CastError') {
                return { error: 'Invalid student, school, or classroom ID', code: 400 };
            }

            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return { errors: messages };
            }

            return { error: 'Failed to transfer student. Please try again.' };
        }
    }

    /**
     * Delete student (School Admin - must belong to their school)
     */
    async deleteStudent({ __auth, __schoolAdmin, studentId }) {
        try {
            const Student = this.mongomodels.Student;

            const student = await Student.findById(studentId);

            if (!student) {
                return { error: 'Student not found', code: 404 };
            }

            // Verify admin has access to this student's school
            if (student.schoolId.toString() !== __schoolAdmin.schoolId) {
                return { error: 'Access denied. This student belongs to a different school.', code: 403 };
            }

            // Delete student
            await student.deleteOne();

            return { message: 'Student deleted successfully' };

        } catch (error) {
            console.error('Delete student error:', error);

            if (error.name === 'CastError') {
                return { error: 'Invalid student ID', code: 400 };
            }

            return { error: 'Failed to delete student. Please try again.' };
        }
    }

}
