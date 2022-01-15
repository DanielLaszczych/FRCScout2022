import { gql } from '@apollo/client';

export const GET_PITFORM = gql`
    query ($event: String!, $teamNumber: Int!) {
        getPitForm(event: $event, teamNumber: $teamNumber) {
            event
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
    query ($event: String!) {
        getEventPitForms(event: $event) {
            event
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
    query ($name: String!) {
        getEvent(name: $name) {
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

export const GET_EVENTS_NAMES = gql`
    {
        getEvents {
            name
        }
    }
`;
