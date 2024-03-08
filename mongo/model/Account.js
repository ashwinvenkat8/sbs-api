const mongoose = require('mongoose');
const crypto = require('node:crypto');

const AccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    accountNumber: {
        type: Number,
        default: crypto.randomInt(1, 2e+14),
        min: 1,
        unique: true
    },
    balance: {
        type: mongoose.Types.Decimal128,
        default: new mongoose.Types.Decimal128('0.0'),
        get: v => parseFloat(v)
    },
    transactions: [{
        type: mongoose.Types.ObjectId,
        ref: 'Transaction',
        default: []
    }],
    beneficiaries: [{
        accountNumber: {
            type: Number
        },
        fullName: {
            type: String
        },
        type: Object,
        default: []
    }]
}, { timestamps: true });

const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;
