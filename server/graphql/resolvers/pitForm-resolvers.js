const PitForm = require('../../models/PitForm');
const cloudinary = require('cloudinary').v2;

module.exports = {
    Query: {
        async getPitForm(_, { eventKey, teamNumber }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const pitForm = await PitForm.findOne({ eventKey: eventKey, teamNumber: teamNumber }).exec();
                if (!pitForm) {
                    throw new Error('Pit form does not exist');
                }
                return pitForm;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getEventsPitForms(_, { eventKey }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const pitForms = await PitForm.find({ eventKey: eventKey }).exec();
                return pitForms;
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

                const pitForm = await PitForm.findOneAndUpdate({ eventKey: pitFormInput.eventKey, teamNumber: pitFormInput.teamNumber }, pitFormInput, { new: true, upsert: true });
                return pitForm;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
