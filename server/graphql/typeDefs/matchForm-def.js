const { gql } = require('apollo-server-express');

module.exports = gql`
    type StartingPosition {
        x: Float
        y: Float
        width: Float
        height: Float
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
        pickedUpAuto: Int
        lowerCargoAuto: Int
        upperCargoAuto: Int
        crossTarmac: Boolean
        autoComment: String
        pickedUpTele: Int
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
        followUp: Boolean!
        followUpComment: String
    }

    input StartingPositionInput {
        x: Float
        y: Float
        width: Float
        height: Float
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
        pickedUpAuto: Int
        lowerCargoAuto: Int
        upperCargoAuto: Int
        crossTarmac: Boolean
        autoComment: String
        pickedUpTele: Int
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
        followUp: Boolean!
        followUpComment: String
    }

    extend type Query {
        getMatchFormByTeam(eventKey: String!, matchNumber: String!, teamNumber: Int!): MatchForm
        getMatchFormByStation(eventKey: String!, matchNumber: String!, station: String!): MatchForm
        getTeamsMatchForms(eventKey: String!, teamNumber: Int!): [MatchForm]
        getMatchFormsFromMatch(eventKey: String!, matchNumber: String!): [MatchForm]
        getEventsMatchForms(eventKey: String!): [MatchForm]
    }

    extend type Mutation {
        updateMatchForm(matchFormInput: MatchFormInput!): MatchForm
    }
`;
