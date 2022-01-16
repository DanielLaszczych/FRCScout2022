const { model, Schema } = require('mongoose');

const motorSchema = new Schema({
    label: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
});

const wheelSchema = new Schema({
    label: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
});

const abilitySchema = new Schema({
    label: {
        type: String,
        required: true,
    },
    value: {
        type: Boolean,
        required: true,
    },
});

const pitFormSchema = new Schema(
    {
        eventKey: {
            type: String,
            required: true,
        },
        eventName: {
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
        weight: {
            type: Number,
        },
        height: {
            type: Number,
        },
        driveTrain: {
            type: String,
        },
        motors: {
            type: [motorSchema],
        },
        wheels: {
            type: [wheelSchema],
        },
        driveTrainComment: {
            type: String,
        },
        programmingLanguage: {
            type: String,
        },
        startingPosition: {
            type: String,
        },
        autoComment: {
            type: String,
        },
        abilities: {
            type: [abilitySchema],
        },
        workingComment: {
            type: String,
        },
        closingComment: {
            type: String,
        },
        image: {
            type: String,
        },
        followUp: {
            type: Boolean,
            required: true,
        },
    },
    { timestamps: true }
);

const PitForm = model('PitForm', pitFormSchema);
module.exports = PitForm;
