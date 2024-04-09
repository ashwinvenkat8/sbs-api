const mongoose = require('mongoose');

const txnStatus = [
    'CREATED',
    'PENDING APPROVAL',
    'REJECTED',
    'COMPLETED',
    'FAILED'
];

const txnType = ['DEBIT', 'CREDIT'];

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
    message: {
        type: String,
        maxLength: 180,
        default: null
    },
    type: {
        type: String,
        enum: {
            values: txnType,
            message: 'Invalid transaction type: {VALUE}'
        }
    },
    status: {
        type: String,
        enum: {
            values: txnStatus,
            message: 'Invalid transaction status: {VALUE}'
        },
        default: 'CREATED'
    },
    review: {
        type: mongoose.Types.ObjectId,
        ref: 'Review',
        default: null
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { toJSON: { getters: true }, timestamps: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;
