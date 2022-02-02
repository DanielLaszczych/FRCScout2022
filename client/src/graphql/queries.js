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
            taxi
            autoComment
            abilities {
                label
                value
            }
            holdingCapacity
            workingComment
            closingComment
            image
            followUp
            followUpComment
        }
    }
`;

export const GET_EVENTS_PITFORMS = gql`
    query ($eventKey: String!) {
        getEventsPitForms(eventKey: $eventKey) {
            eventKey
            eventName
            teamNumber
            teamName
            followUp
            followUpComment
            scouter
        }
    }
`;

export const GET_EVENTS_MATCHFORMS = gql`
    query ($eventKey: String!) {
        getEventsMatchForms(eventKey: $eventKey) {
            _id
            eventKey
            eventName
            matchNumber
            teamNumber
            teamName
            scouter
            station
            followUp
            followUpComment
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
            currentEvent
            startDate
            endDate
        }
    }
`;

export const GET_CURRENT_EVENT = gql`
    {
        getCurrentEvent {
            key
            name
        }
    }
`;

export const GET_MATCHFORM_BY_STATION = gql`
    query ($eventKey: String!, $matchNumber: String!, $station: String!) {
        getMatchFormByStation(eventKey: $eventKey, matchNumber: $matchNumber, station: $station) {
            eventKey
            eventName
            station
            teamNumber
            teamName
            preLoadedCargo
            startingPosition {
                x
                y
                width
                height
            }
            pickedUpAuto
            lowerCargoAuto
            upperCargoAuto
            crossTarmac
            autoComment
            pickedUpTele
            lowerCargoTele
            upperCargoTele
            climbTime
            climbRung
            defenseRating
            loseCommunication
            robotBreak
            yellowCard
            redCard
            endComment
            followUp
            followUpComment
        }
    }
`;
