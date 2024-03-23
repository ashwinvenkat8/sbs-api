const mongoose = require('mongoose');

const reviewStatus = [
    'PENDING APPROVAL',
    'APPROVED',
    'REJECTED',
    'COMPLETED',
    'CANCELLED'
];

const reviewType = ['TRANSACTION', 'PROFILE', 'ACCOUNT'];

const ReviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    reviewee: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: {
            values: reviewType,
            message: 'Invalid review type: {VALUE}'
        }
    },
    status: {
        type: String,
        enum: {
            values: reviewStatus,
            message: 'Invalid review status: {VALUE}'
        },
        default: 'PENDING APPROVAL'
    },
    approvedBy: {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            default: null
        },
        timestamp: {
            type: Date,
            default: null
        }
    }
}, { timestamps: true });

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;
