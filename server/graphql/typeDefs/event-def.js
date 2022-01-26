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
        startDate: String!
        endDate: String!
        teams: [Team]
        key: String!
        currentEvent: Boolean!
    }

    input TeamInput {
        name: String!
        number: Int!
        key: String!
    }

    input EventInput {
        name: String!
        year: Int!
        startDate: String!
        endDate: String!
        teams: [TeamInput]
        key: String!
    }

    extend type Query {
        getEvents: [Event]
        getEvent(key: String!): Event
        getCurrentEvent: Event
        getTeamsEvents(teamNumber: Int!): [Event]
    }

    extend type Mutation {
        createEvent(eventInput: EventInput!): Event
    }
`;
