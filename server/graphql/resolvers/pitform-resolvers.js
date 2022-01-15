const PitForm = require('../../models/PitForm');
const cloudinary = require('cloudinary').v2;

module.exports = {
    Query: {
        async getPitForm(_, { event, teamNumber }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const pitform = await PitForm.findOne({ event: event, teamNumber: teamNumber }).exec();
                if (!pitform) {
                    throw new Error('Pitform does not exist');
                }
                return pitform;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getEventPitForms(_, { event }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const pitforms = await PitForm.find({ event: event }).exec();
                return pitforms;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
    Mutation: {
        async updatePitForm(_, { pitFormInput }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                let imageUrl;
                if (context.req.headers.imagetype === 'Same Image') {
                    imageUrl = pitFormInput.image;
                } else {
                    await cloudinary.uploader.upload(pitFormInput.image, (error, result) => {
                        if (error) {
                            throw new Error('Could not upload image');
                        }
                        imageUrl = result.secure_url;
                    });
                }
                pitFormInput.image = imageUrl;
                pitFormInput.scouter = context.req.user.displayName;

                const pitform = await PitForm.findOneAndUpdate({ event: pitFormInput.event, teamNumber: pitFormInput.teamNumber }, pitFormInput, { new: true, upsert: true });
                return pitform;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
