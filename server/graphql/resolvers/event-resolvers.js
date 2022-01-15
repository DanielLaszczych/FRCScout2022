const Event = require('../../models/Event');

module.exports = {
    Query: {
        async getEvents(_, {}, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const events = await Event.find().exec();
                return events;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getEvent(_, { name }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const event = await Event.findOne({ name: name }).exec();
                if (!event) {
                    throw new Error('Event is not registered inside database');
                }
                return event;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
    Mutation: {
        async createEvent(_, { eventInput }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            } else if (!context.req.user.admin) {
                throw new Error('You must be an admin to create an event');
            }
            try {
                const event = await Event.findOneAndUpdate({ name: eventInput.name }, eventInput, { new: true, upsert: true });
                return event;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
