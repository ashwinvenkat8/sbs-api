const mongoose = require('mongoose');

const txnStatus = [
    'CREATED',
    'PENDING APPROVAL',
    'CANCELLED',
    'REJECTED',
    'COMPLETED',
    'FAILED'
];

const TransactionSchema = new mongoose.Schema({
    from: {
        type: mongoose.Types.ObjectId,
        ref: 'Account'
    },
    to: {
        type: mongoose.Types.ObjectId,
        ref: 'Account'
    },
    amount: {
        type: mongoose.Types.Decimal128,
        default: new mongoose.Types.Decimal128('0.0'),
        get: v => parseFloat(v)
    },
    status: {
        type: String,
        enum: {
            values: txnStatus,
            message: 'Invalid status: {VALUE}'
        },
        default: 'CREATED'
    },
    approvedBy: {
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            default: null
        },
        timestamp: {
            type: Date,
            default: new Date().toISOString()
        }
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;
