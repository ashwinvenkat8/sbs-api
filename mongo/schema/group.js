const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    group_id: {
        type: mongoose.Types.ObjectId
    },
    name: {
        type: String
    },
    description: {
        type: String
    },
    permissions: {
        type: Object,
        default: {}
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

const groupModel = mongoose.connection.useDb('GROUP');
const group = groupModel.model('group', groupSchema);

module.exports = group;
