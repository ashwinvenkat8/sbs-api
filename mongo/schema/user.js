const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
    attributes: {
        type: Object,
        default: {}
    },
    groups: {
        type: Array,
        default: []
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    last_login: {
        type: Date,
        default: null
    },
    created_timestamp: {
        type: Date,
        default: Date.now
    }
});

const userModel = mongoose.connection.useDb('USER');
const user = userModel.model('user', userSchema);

module.exports = user;
