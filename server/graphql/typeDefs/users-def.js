const { gql } = require('apollo-server-express');

module.exports = gql`
    type User {
        _id: ID!
        googleId: String!
        googleDisplayName: String!
        firstName: String!
        lastName: String!
        email: String!
        displayName: String!
        iconImage: String!
        admin: Boolean!
        createdAt: String!
    }

    extend type Query {
        getUsers: [User]
        getUser(_id: ID!): User
    }
`;
