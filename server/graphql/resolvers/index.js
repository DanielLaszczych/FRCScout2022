const eventResolvers = require('./event-resolvers');
const matchFormResolvers = require('./matchForm-resolvers');
const pitFormResolvers = require('./tempName');
const usersResolvers = require('./users-resolvers');

module.exports = [usersResolvers, pitFormResolvers, eventResolvers, matchFormResolvers];
