const { gql } = require('apollo-server-express');

const users = require('./users-def');
const pitForms = require('./pitForm-def');
const events = require('./event-def');
const matchForms = require('./matchForm-def');

const setup = gql`
    type Query {
        _empty: String
    }
    type Mutation {
        _empty: String
    }
    type Subscription {
        _empty: String
    }
`;

module.exports = [setup, users, pitForms, events, matchForms];
