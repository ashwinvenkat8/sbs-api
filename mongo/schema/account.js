const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    account_id: {
        type: mongoose.Types.ObjectId
    },
    user_id: {
        type: String
    },
    balance: {
        type: mongoose.Types.Decimal128,
        default: 0.0
    },
    attributes: {
        type: Object
    },
    isActive: {
        type: Boolean,
        default: false
    },
    created_timestamp: {
        type: Date,
        default: Date.now
    }
});

const accountModel = mongoose.connection.useDb('ACCOUNT');
const account = accountModel.model('account', accountSchema);

module.exports = account;
