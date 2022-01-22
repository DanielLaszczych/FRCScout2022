const { gql } = require('apollo-server-express');

module.exports = gql`
    type StartingPosition {
        x: Float!
        y: Float!
    }

    type MatchForm {
        _id: ID!
        eventKey: String!
        eventName: String!
        station: String!
        matchNumber: String!
        teamNumber: Int!
        teamName: String!
        scouter: String!
        preLoadedCargo: Boolean
        startingPosition: StartingPosition
        lowerCargoAuto: Int
        upperCargoAuto: Int
        crossTarmac: Boolean
        autoComment: String
        lowerCargoTele: Int
        upperCargoTele: Int
        climbTime: Int
        climbRung: String
        defenseRating: Int
        loseCommunication: Boolean
        robotBreak: Boolean
        yellowCard: Boolean
        redCard: Boolean
        endComment: String
    }

    input StartingPositionInput {
        x: Float!
        y: Float!
    }

    input MatchFormInput {
        eventKey: String!
        eventName: String!
        station: String!
        matchNumber: String!
        teamNumber: Int!
        teamName: String!
        preLoadedCargo: Boolean
        startingPosition: StartingPositionInput
        lowerCargoAuto: Int
        upperCargoAuto: Int
        crossTarmac: Boolean
        autoComment: String
        lowerCargoTele: Int
        upperCargoTele: Int
        climbTime: Int
        climbRung: String
        defenseRating: Int
        loseCommunication: Boolean
        robotBreak: Boolean
        yellowCard: Boolean
        redCard: Boolean
        endComment: String
    }

    extend type Query {
        getMatchForm(eventKey: String!, matchNumber: String!, teamNumber: Int!): MatchForm
        getMatchForm(eventKey: String!, matchNumber: String!, station: String!): MatchForm
        getTeamsMatchForms(eventKey: String!, teamNumber: Int!): [MatchForm]
        getMatchFormsFromMatch(eventKey: String!, matchNumber: String!): [MatchForm]
        getEventsMatchForms(eventKey: String!): [MatchForm]
    }

    extend type Mutation {
        updateMatchForm(matchFormInput: MatchFormInput!): MatchForm
    }
`;
