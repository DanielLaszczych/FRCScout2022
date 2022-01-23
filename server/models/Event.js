const { model, Schema } = require('mongoose');

const eventSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    teams: [
        {
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
            _id: false,
        },
    ],
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
