import { useQuery } from '@apollo/client';
import { Box } from '@chakra-ui/react';
import { React, useState } from 'react';
import { GET_EVENTS_KEYS_NAMES, GET_EVENT_MATCHFORMS } from '../graphql/queries';

function MatchesPage() {
    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '' });
    const [focusedEvent, setFocusedEvent] = useState('');

    const { loading: loadingEvents, data: { getEvents: events } = {} } = useQuery(GET_EVENTS_KEYS_NAMES, {
        fetchPolicy: 'network-only',
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
        },
        onCompleted({ getEvents: events }) {
            if (events.length > 0) {
                let currentEvent = events.find((event) => event.currentEvent);
                if (currentEvent === undefined) {
                    setCurrentEvent({ name: events[0].name, key: events[0].key });
                    setFocusedEvent(events[0].name);
                } else {
                    setCurrentEvent({ name: currentEvent.name, key: currentEvent.key });
                    setFocusedEvent(currentEvent.name);
                }
            }
        },
    });

    const { loading: loadingMatchForms, data: { getEventsMatchForms: matchForms } = {} } = useQuery(GET_EVENT_MATCHFORMS, {
        skip: currentEvent.key === '',
        fetchPolicy: 'network-only',
        variables: {
            eventKey: currentEvent.key,
        },
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
        },
    });

    return <Box margin={'0 auto'} width={{ base: '90%', md: '66%', lg: '66%' }}></Box>;
}

export default MatchesPage;
