const { model, Schema, Mongoose } = require('mongoose');

const startingPositionSchema = new Schema({
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    },
});

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
        type: startingPositionSchema,
    },
    missedAuto: {
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
    missedTele: {
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
    receivedDefense: {
        type: Boolean,
    },
    autoReject: {
        type: Boolean,
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
