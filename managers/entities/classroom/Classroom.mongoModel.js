const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        trim: true,
        maxlength: [50, 'Room number cannot exceed 50 characters']
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1'],
        validate: {
            validator: Number.isInteger,
            message: 'Capacity must be an integer'
        }
    },
    resources: {
        type: [String],
        default: [],
        validate: {
            validator: function (arr) {
                return arr.every(item => typeof item === 'string' && item.trim().length > 0);
            },
            message: 'All resources must be non-empty strings'
        }
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'School ID is required'],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['available', 'occupied', 'maintenance'],
            message: 'Status must be available, occupied, or maintenance'
        },
        default: 'available'
    }
}, {
    timestamps: true
});

// Compound unique index to prevent duplicate room numbers within the same school
classroomSchema.index({ schoolId: 1, roomNumber: 1 }, { unique: true });

// Index for filtering by status
classroomSchema.index({ status: 1 });

// Virtual to check if classroom is at capacity
classroomSchema.virtual('isAtCapacity').get(function () {
    // This would need to be populated with actual student count
    return false; // Placeholder
});

module.exports = mongoose.model('Classroom', classroomSchema);
