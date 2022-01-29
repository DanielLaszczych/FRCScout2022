const { model, Schema } = require('mongoose');

const matchFormSchema = new Schema({
    eventKey: {
        type: String,
        required: true,
    },
    eventName: {
        type: String,
        required: true,
    },
    station: {
        type: String,
        required: true,
    },
    matchNumber: {
        type: String,
        required: true,
    },
    teamNumber: {
        type: Number,
        required: true,
    },
    teamName: {
        type: String,
        required: true,
    },
    scouter: {
        type: String,
        required: true,
    },
    preLoadedCargo: {
        type: Boolean,
        required: true,
    },
    startingPosition: {
        x: {
            type: Number,
            required: true,
        },
        y: {
            type: Number,
            required: true,
        },
        width: {
            type: Number,
            required: true,
        },
        height: {
            type: Number,
            required: true,
        },
        _id: false,
    },
    pickedUpAuto: {
        type: Number,
        required: true,
    },
    lowerCargoAuto: {
        type: Number,
        required: true,
    },
    upperCargoAuto: {
        type: Number,
        required: true,
    },
    crossTarmac: {
        type: Boolean,
        required: true,
    },
    autoComment: {
        type: String,
        required: true,
    },
    pickedUpTele: {
        type: Number,
        required: true,
    },
    lowerCargoTele: {
        type: Number,
        required: true,
    },
    upperCargoTele: {
        type: Number,
        required: true,
    },
    climbTime: {
        type: Number,
        required: true,
    },
    climbRung: {
        type: String,
        required: true,
    },
    defenseRating: {
        type: Number,
        required: true,
    },
    loseCommunication: {
        type: Boolean,
        required: true,
    },
    robotBreak: {
        type: Boolean,
        required: true,
    },
    yellowCard: {
        type: Boolean,
        required: true,
    },
    redCard: {
        type: Boolean,
        required: true,
    },
    endComment: {
        type: String,
        required: true,
    },
});

const MatchForm = model('MatchForm', matchFormSchema);
module.exports = MatchForm;
