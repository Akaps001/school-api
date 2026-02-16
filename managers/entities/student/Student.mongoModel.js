const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters long'],
        maxlength: [100, 'First name cannot exceed 100 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters long'],
        maxlength: [100, 'Last name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function (value) {
                const today = new Date();
                const age = today.getFullYear() - value.getFullYear();
                return value < today && age <= 100;
            },
            message: 'Please provide a valid date of birth'
        }
    },
    enrollmentStatus: {
        type: String,
        enum: {
            values: ['active', 'transferred', 'graduated', 'withdrawn'],
            message: 'Enrollment status must be active, transferred, graduated, or withdrawn'
        },
        default: 'active'
    },
    enrollmentDate: {
        type: Date,
        required: [true, 'Enrollment date is required'],
        default: Date.now
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'School ID is required'],
        index: true
    },
    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        default: null,
        index: true
    },
    guardianName: {
        type: String,
        required: [true, 'Guardian name is required'],
        trim: true,
        minlength: [3, 'Guardian name must be at least 3 characters long'],
        maxlength: [200, 'Guardian name cannot exceed 200 characters']
    },
    guardianPhone: {
        type: String,
        required: [true, 'Guardian phone is required'],
        trim: true,
        match: [/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number']
    }
}, {
    timestamps: true
});

// Indexes for performance
studentSchema.index({ email: 1 });
studentSchema.index({ schoolId: 1, enrollmentStatus: 1 });
studentSchema.index({ classroomId: 1 });
studentSchema.index({ firstName: 'text', lastName: 'text', email: 'text' }); // For text search

// Virtual for full name
studentSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);
