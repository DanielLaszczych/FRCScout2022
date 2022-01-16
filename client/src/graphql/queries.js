import { gql } from '@apollo/client';

export const GET_PITFORM = gql`
    query ($eventKey: String!, $teamNumber: Int!) {
        getPitForm(eventKey: $eventKey, teamNumber: $teamNumber) {
            eventKey
            eventName
            teamNumber
            teamName
            weight
            height
            driveTrain
            motors {
                label
                value
            }
            wheels {
                label
                size
                value
            }
            driveTrainComment
            programmingLanguage
            startingPosition
            autoComment
            abilities {
                label
                value
            }
            workingComment
            closingComment
            image
            followUp
        }
    }
`;

export const GET_EVENT_PITFORMS = gql`
    query ($eventKey: String!) {
        getEventPitForms(eventKey: $eventKey) {
            eventKey
            eventName
            teamNumber
            teamName
            followUp
        }
    }
`;

export const GET_EVENTS = gql`
    {
        getEvents {
            name
            year
            teams {
                name
                number
                key
            }
            key
        }
    }
`;

export const GET_EVENT = gql`
    query ($key: String!) {
        getEvent(key: $key) {
            name
            year
            teams {
                name
                number
                key
            }
            key
        }
    }
`;

export const GET_EVENTS_KEYS_NAMES = gql`
    {
        getEvents {
            key
            name
        }
    }
`;
