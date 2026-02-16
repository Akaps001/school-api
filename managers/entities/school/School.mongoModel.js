const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'School name is required'],
        unique: true,
        trim: true,
        minlength: [3, 'School name must be at least 3 characters long'],
        maxlength: [200, 'School name cannot exceed 200 characters']
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    contactEmail: {
        type: String,
        required: [true, 'Contact email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    contactPhone: {
        type: String,
        required: [true, 'Contact phone is required'],
        trim: true,
        match: [/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number']
    },
    establishmentDate: {
        type: Date,
        required: [true, 'Establishment date is required'],
        validate: {
            validator: function (value) {
                return value <= new Date();
            },
            message: 'Establishment date cannot be in the future'
        }
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
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive'],
            message: 'Status must be either active or inactive'
        },
        default: 'active'
    }
}, {
    timestamps: true
});

// Indexes for performance
schoolSchema.index({ name: 1 });
schoolSchema.index({ status: 1 });
schoolSchema.index({ name: 'text' }); // For text search

module.exports = mongoose.model('School', schoolSchema);
