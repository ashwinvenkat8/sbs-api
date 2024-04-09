const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    accountNumber: {
        type: Number,
        min: 1,
        unique: true
    },
    balance: {
        type: mongoose.Types.Decimal128,
        default: new mongoose.Types.Decimal128('0.0'),
        min: 0,
        get: v => parseFloat(v.toString()),
    },
    transactions: [{
        type: mongoose.Types.ObjectId,
        ref: 'Transaction',
        default: []
    }],
    review: {
        type: mongoose.Types.ObjectId,
        ref: 'Review',
        default: null
    }
}, { toJSON: { getters: true }, timestamps: true });

const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;
