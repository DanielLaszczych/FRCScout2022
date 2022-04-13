const { gql } = require('apollo-server-express');

module.exports = gql`
    type Motor {
        _id: ID!
        label: String!
        value: Int!
    }

    type Wheel {
        _id: ID!
        label: String!
        size: Float
        value: Int!
    }

    type DriveStats {
        _id: ID!
        drivingGear: Float!
        drivenGear: Float!
        freeSpeed: Float!
        pushingPower: Float!
    }

    type PitForm {
        _id: ID!
        eventKey: String!
        eventName: String!
        teamNumber: Int!
        teamName: String!
        scouter: String!
        weight: Float
        height: Float
        driveTrain: String
        motors: [Motor]
        wheels: [Wheel]
        driveStats: [DriveStats]
        driveTrainComment: String
        programmingLanguage: String
        startingPosition: String
        taxi: String
        autoComment: String
        abilities: [String]
        holdingCapacity: Int
        workingComment: String
        closingComment: String
        image: String
        followUp: Boolean!
        followUpComment: String
        createdAt: String
    }

    input MotorInput {
        label: String!
        value: Int!
    }

    input WheelInput {
        label: String!
        size: Float
        value: Int!
    }

    input GearRatioInput {
        drivingGear: Float!
        drivenGear: Float!
    }

    input PitFormInput {
        eventKey: String!
        eventName: String!
        teamNumber: Int!
        teamName: String!
        weight: Float
        height: Float
        driveTrain: String
        motors: [MotorInput]
        wheels: [WheelInput]
        gearRatios: [GearRatioInput]
        driveTrainComment: String
        programmingLanguage: String
        startingPosition: String
        taxi: String
        autoComment: String
        abilities: [String]
        holdingCapacity: Int
        workingComment: String
        closingComment: String
        image: String
        followUp: Boolean!
        followUpComment: String
    }

    extend type Query {
        getPitForm(eventKey: String!, teamNumber: Int!): PitForm
        getEventsPitForms(eventKey: String!): [PitForm]
        getTeamsPitForms(teamNumber: Int!): [PitForm]
    }

    extend type Mutation {
        updatePitForm(pitFormInput: PitFormInput!): PitForm
    }
`;
