const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const roles = [
    'CUSTOMER',
    'MERCHANT',
    'EMPLOYEE',
    'SYSTEM_MANAGER',
    'SYSTEM_ADMIN'
];

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        maxLength: 20
    },
    password: {
        type: String,
        minLength: 12,
        maxLength: 72
    },
    otp: {
        isVerified: {
            type: Boolean,
            default: false
        },
        secret: {
            type: String,
            default: null
        }
    },
    role: {
        type: String,
        enum: {
            values: roles,
            message: 'Invalid role: {VALUE}'
        }
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

UserSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
}

const User = mongoose.model('User', UserSchema);

module.exports = User;
