const { model, Schema } = require('mongoose');

const teamSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
});

const eventSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    teams: {
        type: [teamSchema],
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
    currentEvent: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const Event = model('Event', eventSchema);
module.exports = Event;
