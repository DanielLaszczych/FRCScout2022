const eventResolvers = require('./event-resolvers');
const pitformResolvers = require('./pitform-resolvers');
const usersResolvers = require('./users-resolvers');

module.exports = [usersResolvers, pitformResolvers, eventResolvers];
