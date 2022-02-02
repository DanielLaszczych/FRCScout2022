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
    },
    lowerCargoAuto: {
        type: Number,
    },
    upperCargoAuto: {
        type: Number,
    },
    crossTarmac: {
        type: Boolean,
    },
    autoComment: {
        type: String,
    },
    pickedUpTele: {
        type: Number,
    },
    lowerCargoTele: {
        type: Number,
    },
    upperCargoTele: {
        type: Number,
    },
    climbTime: {
        type: Number,
    },
    climbRung: {
        type: String,
    },
    defenseRating: {
        type: Number,
    },
    loseCommunication: {
        type: Boolean,
    },
    robotBreak: {
        type: Boolean,
    },
    yellowCard: {
        type: Boolean,
    },
    redCard: {
        type: Boolean,
    },
    endComment: {
        type: String,
    },
    followUp: {
        type: Boolean,
        required: true,
    },
    followUpComment: {
        type: String,
    },
});

const MatchForm = model('MatchForm', matchFormSchema);
module.exports = MatchForm;
