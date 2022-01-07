const { model, Schema } = require('mongoose');

const userSchema = new Schema(
    {
        googleId: {
            type: String,
            required: true,
        },
        googleDisplayName: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        displayName: {
            type: String,
            required: true,
        },
        iconImage: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const User = model('User', userSchema);
module.exports = User;
