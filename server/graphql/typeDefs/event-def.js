const { gql } = require('apollo-server-express');

module.exports = gql`
    type Team {
        name: String!
        number: Int!
        key: String!
    }

    type Event {
        name: String!
        year: Int!
        teams: [Team]
        key: String!
    }

    input TeamInput {
        name: String!
        number: Int!
        key: String!
    }

    input EventInput {
        name: String!
        year: Int!
        teams: [TeamInput]
        key: String!
    }

    extend type Query {
        getEvents: [Event]
        getEvent(name: String!): Event
    }

    extend type Mutation {
        createEvent(eventInput: EventInput!): Event
    }
`;
