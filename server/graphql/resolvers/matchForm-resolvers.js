const MatchForm = require('../../models/MatchForm');

module.exports = {
    Query: {
        async getMatchFormByTeam(_, { eventKey, matchNumber, teamNumber }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const matchForm = await MatchForm.findOne({ eventKey: eventKey, matchNumber: matchNumber, teamNumber: teamNumber }).exec();
                if (!matchForm) {
                    throw new Error('Match form does not exist');
                }
                return matchForm;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getMatchFormByStation(_, { eventKey, matchNumber, station }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const matchForm = await MatchForm.findOne({ eventKey: eventKey, matchNumber: matchNumber, station: station }).exec();
                if (!matchForm) {
                    throw new Error('Match form does not exist');
                }
                return matchForm;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getTeamsMatchForms(_, { teamNumber }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const matchForms = await MatchForm.find({ teamNumber: teamNumber, followUp: false }).exec();
                return matchForms;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getMatchFormsFromMatch(_, { eventKey, matchNumber }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const matchForms = await MatchForm.find({ eventKey: eventKey, matchNumber: matchNumber }).exec();
                return matchForms;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getMatchFormsForAnalysis(_, { eventKey, teams }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const matchForms = await MatchForm.find({ eventKey: eventKey, teamNumber: { $in: teams }, followUp: false, noShow: false }).exec();
                return matchForms;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getEventsMatchForms(_, { eventKey }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const matchForms = await MatchForm.find({ eventKey: eventKey }).exec();
                return matchForms;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
    Mutation: {
        async updateMatchForm(_, { matchFormInput }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                matchFormInput.scouter = context.req.user.displayName;

                const matchForm = await MatchForm.findOneAndUpdate({ eventKey: matchFormInput.eventKey, matchNumber: matchFormInput.matchNumber, teamNumber: matchFormInput.teamNumber }, matchFormInput, { new: true, upsert: true }).exec();
                return matchForm;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
