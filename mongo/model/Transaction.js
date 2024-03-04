const mongoose = require('mongoose');

const txnStatus = [
    'created',
    'pending approval',
    'completed',
    'cancelled',
    'rejected'
];

const transactionSchema = new mongoose.Schema({
    from: {
        type: mongoose.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    to: {
        type: mongoose.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    amount: {
        type: mongoose.Types.Decimal128,
        required: true,
        default: new mongoose.Types.Decimal128('0.0'),
        get: v => parseFloat(v)
    },
    status: {
        type: String,
        enum: {
            values: txnStatus,
            message: 'Invalid status: {VALUE}'
        },
        default: 'created'
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

const transactionModel = mongoose.connection.useDb('TRANSACTION');
const transaction = transactionModel.model('transaction', transactionSchema);

module.exports = transaction;
