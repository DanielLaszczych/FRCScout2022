const { model, Schema } = require('mongoose');

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
        motors: [
            {
                label: {
                    type: String,
                    required: true,
                },
                value: {
                    type: Number,
                    required: true,
                },
                _id: false,
            },
        ],
        wheels: [
            {
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
                _id: false,
            },
        ],
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
        abilities: [
            {
                label: {
                    type: String,
                    required: true,
                },
                value: {
                    type: Boolean,
                    required: true,
                },
                _id: false,
            },
        ],
        holdingCapacity: {
            type: Number,
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
