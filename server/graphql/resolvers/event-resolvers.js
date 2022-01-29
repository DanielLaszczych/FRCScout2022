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
        async getEvent(_, { key }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const event = await Event.findOne({ key: key }).exec();
                if (!event) {
                    throw new Error('Event is not registered inside database');
                }
                return event;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getCurrentEvent(_, {}, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const event = await Event.findOne({ currentEvent: true }).exec();
                if (!event) {
                    throw new Error('There is no current event');
                }
                return event;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getTeamsEvents(_, { teamNumber }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const events = await Event.find({ teams: { $elemMatch: { number: teamNumber } } }).exec();
                return events;
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
                const event = await Event.findOneAndUpdate({ key: eventInput.key }, eventInput, { new: true, upsert: true }).exec();
                return event;
            } catch (err) {
                throw new Error(err);
            }
        },
        async removeEvent(_, { key }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            } else if (!context.req.user.admin) {
                throw new Error('You must be an admin to remove an event');
            }
            try {
                const event = await Event.findOne({ key: key }).exec();
                if (!event) {
                    throw new Error('This event does not exist inside the database');
                } else {
                    await event.delete();
                    return event;
                }
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
