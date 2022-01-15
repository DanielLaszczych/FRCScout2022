const { gql } = require('apollo-server-express');

module.exports = gql`
    type Motor {
        label: String!
        value: Int!
    }

    type Wheel {
        label: String!
        size: Float
        value: Int!
    }

    type Ability {
        label: String!
        value: Boolean!
    }

    type PitForm {
        _id: ID!
        event: String!
        teamNumber: Int!
        teamName: String!
        scouter: String!
        weight: Float
        height: Float
        driveTrain: String
        motors: [Motor]
        wheels: [Wheel]
        driveTrainComment: String
        programmingLanguage: String
        startingPosition: String
        autoComment: String
        abilities: [Ability]
        workingComment: String
        closingComment: String
        image: String
        followUp: Boolean!
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

    input AbilityInput {
        label: String!
        value: Boolean!
    }

    input PitFormInput {
        event: String!
        teamNumber: Int!
        teamName: String!
        weight: Float
        height: Float
        driveTrain: String
        motors: [MotorInput]
        wheels: [WheelInput]
        driveTrainComment: String
        programmingLanguage: String
        startingPosition: String
        autoComment: String
        abilities: [AbilityInput]
        workingComment: String
        closingComment: String
        image: String
        followUp: Boolean!
    }

    extend type Query {
        getPitForm(event: String!, teamNumber: Int!): PitForm
        getEventPitForms(event: String!): [PitForm]
    }

    extend type Mutation {
        updatePitForm(pitFormInput: PitFormInput!): PitForm
    }
`;
