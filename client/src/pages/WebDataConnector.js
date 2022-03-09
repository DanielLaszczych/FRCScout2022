import { useQuery } from '@apollo/client';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Button, Center, Input, InputGroup, InputRightElement, Menu, MenuButton, MenuItem, MenuList, Spinner } from '@chakra-ui/react';
import { React, useEffect, useRef, useState } from 'react';
import { GET_EVENTS_KEYS_NAMES } from '../graphql/queries';
import { sortRegisteredEvents } from '../util/helperFunctions';

function WebDataConnector() {
    let inputRef = useRef();

    const [error, setError] = useState(null);
    const [show, setShow] = useState(false);
    const [attempted, setAttempted] = useState(false);
    const [password, setPassword] = useState('');
    const [validating, setValidating] = useState(false);
    const [validPass, setValidPass] = useState(false);
    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '' });
    const [focusedEvent, setFocusedEvent] = useState('');

    useEffect(() => {
        return () => (window.tableau.password = undefined);
    }, []);

    const {
        loading: loadingEvents,
        error: eventsError,
        data: { getEvents: events } = {},
    } = useQuery(GET_EVENTS_KEYS_NAMES, {
        fetchPolicy: 'network-only',
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, could not retrieve registered events');
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
        window.tableau.password = password;
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

    return !validPass ? (
        <Box margin={'0 auto'} textAlign={'center'} width={{ base: '85%', sm: '66%', md: '50%', lg: '25%' }}>
            <InputGroup outline={attempted && !validating ? 'solid red 2px' : 'none'} borderRadius={'var(--chakra-radii-md)'} margin={'0 auto'}>
                <Input
                    ref={inputRef}
                    pr='4.5rem'
                    disabled={validating}
                    _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={show ? 'text' : 'password'}
                    placeholder='Enter password'
                    onKeyPress={(event) => {
                        if (event.key === 'Enter') {
                            if (!attempted) {
                                setAttempted(true);
                            }
                            setValidating(true);
                            fetch(`/checkTableauPass/${password}`)
                                .then((res) => res.text())
                                .then((data) => {
                                    if (data === 'Valid') {
                                        setValidPass(true);
                                    } else {
                                        setValidPass(false);
                                        setValidating(false);
                                        inputRef.current.focus();
                                    }
                                })
                                .catch((err) => {
                                    setValidPass(false);
                                    setValidating(false);
                                    inputRef.current.focus();
                                });
                        }
                    }}
                    enterKeyHint='done'
                />
                <InputRightElement width='4.5rem'>
                    <Button _focus={{ outline: 'none' }} h='1.75rem' size='sm' onClick={() => setShow((prevShow) => !prevShow)}>
                        {show ? 'Hide' : 'Show'}
                    </Button>
                </InputRightElement>
            </InputGroup>
            <Button
                isLoading={validating}
                marginTop={'50px'}
                _focus={{ outline: 'none' }}
                disabled={password.trim() === ''}
                onClick={() => {
                    if (!attempted) {
                        setAttempted(true);
                    }
                    setValidating(true);
                    fetch(`/checkTableauPass/${password}`)
                        .then((res) => res.text())
                        .then((data) => {
                            if (data === 'Valid') {
                                setValidPass(true);
                            } else {
                                setValidPass(false);
                                setValidating(false);
                                inputRef.current.focus();
                            }
                        })
                        .catch((err) => {
                            setValidPass(false);
                            setValidating(false);
                            inputRef.current.focus();
                        });
                }}
            >
                Log In
            </Button>
        </Box>
    ) : (
        <Box margin={'0 auto'} textAlign={'center'} width={{ base: '85%', sm: '66%', md: '50%', lg: '25%' }}>
            <Center>
                <Menu placement='bottom'>
                    <MenuButton maxW={'75vw'} onClick={() => setFocusedEvent('')} _focus={{ outline: 'none' }} as={Button} rightIcon={<ChevronDownIcon />}>
                        <Box overflow={'hidden'} textOverflow={'ellipsis'}>
                            {currentEvent.name}
                        </Box>
                    </MenuButton>
                    <MenuList>
                        {sortRegisteredEvents(events).map((eventItem) => (
                            <MenuItem
                                textAlign={'center'}
                                justifyContent={'center'}
                                _focus={{ backgroundColor: 'none' }}
                                onMouseEnter={() => setFocusedEvent(eventItem.name)}
                                backgroundColor={(currentEvent.name === eventItem.name && focusedEvent === '') || focusedEvent === eventItem.name ? 'gray.100' : 'none'}
                                maxW={'75vw'}
                                key={eventItem.key}
                                onClick={() => setCurrentEvent({ name: eventItem.name, key: eventItem.key })}
                            >
                                {eventItem.name}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </Center>
            <Button marginTop={'50px'} onClick={() => submit()}>
                Get Data
            </Button>
        </Box>
    );
}

export default WebDataConnector;
