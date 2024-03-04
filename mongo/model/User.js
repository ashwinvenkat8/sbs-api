const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const roles = [
    'customer',
    'merchant',
    'employee',
    'system_manager',
    'system_admin'
];

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        maxLength: 20,
        required: true
    },
    password: {
        type: String,
        minLength: 12,
        maxLength: 72,
        required: true
    },
    role: {
        type: String,
        enum: {
            values: roles,
            message: 'Invalid role: {VALUE}'
        },
        required: true
    },
    attributes: {
        type: Object,
        default: {}
    },
    sessions: [{
        sessionId: {
            type: String,
            default: null
        },
        token: {
            type: String,
            default: null
        },
        type: Object,
        default: null
    }],
    last_login: {
        type: Date,
        default: null
    }
}, { timestamps: true });

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
}

const userModel = mongoose.connection.useDb('USER');
const user = userModel.model('user', userSchema);

module.exports = user;
