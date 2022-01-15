const { gql } = require('apollo-server-express');

const users = require('./users-def');
const pitforms = require('./pitform-def');
const events = require('./event-def');

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

module.exports = [setup, users, pitforms, events];
