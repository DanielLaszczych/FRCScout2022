import { useQuery } from '@apollo/client';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { AuthContext } from '../context/auth';
import { Box, Button, Center, Menu, MenuButton, MenuItem, MenuList, Spinner, Text, VStack } from '@chakra-ui/react';
import { React, useContext, useEffect, useState } from 'react';
import { GET_EVENTS_KEYS_NAMES } from '../graphql/queries';
import { sortRegisteredEvents } from '../util/helperFunctions';

function WebDataConnector() {
    const { user } = useContext(AuthContext);

    const [error, setError] = useState(null);
    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '' });
    const [focusedEvent, setFocusedEvent] = useState('');

    useEffect(() => {
        window.tableau.password = user.googleIDToken;

        return () => (window.tableau.password = null);
    }, [user.googleIDToken]);

    const {
        loading: loadingEvents,
        error: eventsError,
        data: { getEvents: events } = {},
    } = useQuery(GET_EVENTS_KEYS_NAMES, {
        fetchPolicy: 'network-only',
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, check console for logs');
        },
        onCompleted({ getEvents: events }) {
            let sortedEvents = sortRegisteredEvents(events);
            if (sortedEvents.length > 0) {
                let currentEvent = sortedEvents.find((event) => event.currentEvent);
                if (currentEvent === undefined) {
                    setCurrentEvent({ name: sortedEvents[sortedEvents.length - 1].name, key: sortedEvents[sortedEvents.length - 1].key });
                    setFocusedEvent(sortedEvents[sortedEvents.length - 1].name);
                } else {
                    setCurrentEvent({ name: currentEvent.name, key: currentEvent.key });
                    setFocusedEvent(currentEvent.name);
                }
            } else {
                setError('No events registered in the database');
            }
        },
    });

    function submit() {
        let data = {
            eventKey: currentEvent.key,
        };
        window.tableau.connectionData = JSON.stringify(data);
        window.tableau.connectionName = `Match Data For ${currentEvent.name}`; // This will be the data source name in Tableau
        window.tableau.submit(); // This sends the connector object to Tableau
    }

    if (error) {
        return (
            <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                {error}
            </Box>
        );
    }

    if (loadingEvents || currentEvent.key === '' || (eventsError && error !== false)) {
        return (
            <Center>
                <Spinner></Spinner>
            </Center>
        );
    }

    return (
        <VStack spacing={'50px'}>
            <Menu placement='auto'>
                <MenuButton onClick={() => setFocusedEvent('')} _focus={{ outline: 'none' }} textOverflow={'ellipsis'} whiteSpace={'nowrap'} overflow={'hidden'} textAlign={'center'} as={Button} rightIcon={<ChevronDownIcon />}>
                    {currentEvent.name}
                </MenuButton>
                <MenuList textAlign={'center'}>
                    {sortRegisteredEvents(events).map((eventItem, index) => (
                        <MenuItem
                            _focus={{ backgroundColor: 'none' }}
                            onMouseEnter={() => setFocusedEvent(eventItem.name)}
                            backgroundColor={(currentEvent.name === eventItem.name && focusedEvent === '') || focusedEvent === eventItem.name ? 'gray.100' : 'none'}
                            maxW={'75vw'}
                            textAlign={'center'}
                            key={index}
                            onClick={() => setCurrentEvent({ name: eventItem.name, key: eventItem.key })}
                        >
                            <Text margin={'0 auto'}>{eventItem.name}</Text>
                        </MenuItem>
                    ))}
                </MenuList>
            </Menu>
            <Button onClick={() => submit()}>Get Data</Button>
        </VStack>
    );
}

export default WebDataConnector;
