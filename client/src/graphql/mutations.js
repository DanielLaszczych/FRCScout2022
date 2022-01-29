import { gql } from '@apollo/client';

export const UPDATE_PITFORM = gql`
    mutation ($pitFormInput: PitFormInput!) {
        updatePitForm(pitFormInput: $pitFormInput) {
            eventName
            teamNumber
        }
    }
`;

export const CREATE_EVENT = gql`
    mutation ($eventInput: EventInput!) {
        createEvent(eventInput: $eventInput) {
            name
            key
            startDate
            endDate
            eventType
        }
    }
`;

export const REMOVE_EVENT = gql`
    mutation ($key: String!) {
        removeEvent(key: $key) {
            name
            key
            week
            eventType
            startDate
            endDate
            year
        }
    }
`;

export const UPDATE_MATCHFORM = gql`
    mutation ($matchFormInput: MatchFormInput!) {
        updateMatchForm(matchFormInput: $matchFormInput) {
            eventName
            teamNumber
        }
    }
`;
