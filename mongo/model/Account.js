const mongoose = require('mongoose');
const crypto = require('node:crypto');

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountNumber: {
        type: Number,
        required: true,
        default: crypto.randomInt(1, 2e+14),
        min: 1,
        unique: true
    },
    balance: {
        type: mongoose.Types.Decimal128,
        required: true,
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
            type: Number,
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        type: Object,
        default: []
    }]
}, { timestamps: true });

const accountModel = mongoose.connection.useDb('ACCOUNT');
const account = accountModel.model('account', accountSchema);

module.exports = account;
