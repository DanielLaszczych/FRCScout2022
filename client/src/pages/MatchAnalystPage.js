import { useQuery } from '@apollo/client';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Button, Center, HStack, Menu, MenuButton, MenuItem, MenuList, NumberInput, NumberInputField, Spinner } from '@chakra-ui/react';
import { React, useCallback, useEffect, useState } from 'react';
import { GET_EVENTS_KEYS_NAMES } from '../graphql/queries';
import { sortRegisteredEvents } from '../util/helperFunctions';
import { v4 as uuidv4 } from 'uuid';

let matchTypes = [
    { label: 'Quals', value: 'q', id: uuidv4() },
    { label: 'Quarters', value: 'qf', id: uuidv4() },
    { label: 'Semis', value: 'sf', id: uuidv4() },
    { label: 'Finals', value: 'f', id: uuidv4() },
];

function MatchAnalystPage() {
    const [error, setError] = useState(null);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1200);
    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '' });
    const [focusedEvent, setFocusedEvent] = useState('');
    const [matchType, setMatchType] = useState('');
    const [focusedMatchType, setFocusedMatchType] = useState('');
    const [matchNumber, setMatchNumber] = useState(null);
    const [tieBreaker, setTieBreaker] = useState(false);
    const [fetchingTeams, setFetchingTeams] = useState(false);
    const [teams, setTeams] = useState(null);

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

    const updateDesktop = () => {
        setIsDesktop(window.innerWidth > 1200);
    };

    useEffect(() => {
        window.addEventListener('resize', updateDesktop);

        return () => window.removeEventListener('resize', updateDesktop);
    }, []);

    const getMatchKey = useCallback(() => {
        let matchKey;
        if (matchType.value === 'q') {
            if (matchNumber === '') {
                return null;
            }
            matchKey = `qm${matchNumber}`;
        } else {
            if (matchNumber === '') {
                return null;
            }
            let param1;
            let param2;
            switch (matchType.value) {
                case 'qf':
                    if (matchNumber > 8 || (matchNumber > 4 && tieBreaker)) {
                        return null;
                    }
                    param1 = matchNumber % 4 === 0 ? 4 : matchNumber % 4;
                    param2 = tieBreaker ? 3 : matchNumber % 4 === 0 ? matchNumber / 4 : Math.floor(matchNumber / 4) + 1;
                    break;
                case 'sf':
                    if (matchNumber > 4 || (matchNumber > 2 && tieBreaker)) {
                        return null;
                    }
                    param1 = matchNumber % 2 === 0 ? 2 : matchNumber % 2;
                    param2 = tieBreaker ? 3 : matchNumber % 2 === 0 ? matchNumber / 2 : Math.floor(matchNumber / 2) + 1;
                    break;
                case 'f':
                    if (matchNumber > 3) {
                        return null;
                    }
                    param1 = 1;
                    param2 = matchNumber;
                    break;
                default:
                    return null;
            }
            matchKey = `${matchType.value}${param1}m${param2}`;
        }
        return matchKey;
    }, [matchNumber, tieBreaker, matchType.value]);

    const getTeams = useCallback(() => {
        let matchKey = getMatchKey();
        if (matchKey === null) {
            return;
        } else {
            setFetchingTeams(true);
            fetch(`/blueAlliance/match/${currentEvent.key}_${matchKey}/simple`)
                .then((response) => response.json())
                .then((data) => {
                    if (!data.Error) {
                        setTeams(data.alliances.red.team_keys.concat(data.alliances.blue.team_keys));
                    } else {
                        setTeams(null);
                        // setError(data.Error);
                    }
                    setFetchingTeams(false);
                })
                .catch((error) => {
                    setFetchingTeams(false);
                    setError(error);
                });
        }
    }, [currentEvent.key, getMatchKey]);

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
        <Box margin={'0 auto'} textAlign='center' width={{ base: '85%', md: '66%', lg: '50%' }}>
            <Box marginBottom={'10px'}>
                <Menu placement='auto'>
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
            </Box>
            <Box marginBottom={'10px'}>
                <Menu placement='bottom'>
                    <MenuButton maxW={'75vw'} onClick={() => setFocusedMatchType(matchType)} _focus={{ outline: 'none' }} as={Button} rightIcon={<ChevronDownIcon />}>
                        <Box overflow={'hidden'} textOverflow={'ellipsis'}>
                            {matchType === '' ? 'Choose Match Type' : matchType.label}
                        </Box>
                    </MenuButton>
                    <MenuList>
                        {matchTypes.map((matchTypeItem) => (
                            <MenuItem
                                textAlign={'center'}
                                justifyContent={'center'}
                                _focus={{ backgroundColor: 'none' }}
                                onMouseEnter={() => setFocusedMatchType(matchTypeItem)}
                                backgroundColor={(matchType.value === matchTypeItem.value && focusedMatchType === '') || focusedMatchType.value === matchTypeItem.value ? 'gray.100' : 'none'}
                                maxW={'75vw'}
                                key={matchTypeItem.id}
                                onClick={() => {
                                    setMatchNumber('');
                                    setTieBreaker(false);
                                    setMatchType(matchTypeItem);
                                }}
                            >
                                {matchTypeItem.label}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </Box>
            <HStack margin={'0 auto'} marginBottom={'10px'} justifyContent='center' width={{ base: '85%', md: '66%', lg: '50%' }}>
                {matchType !== '' ? (
                    <NumberInput onChange={(value) => setMatchNumber(parseInt(value))} precision={0}>
                        <NumberInputField
                            h={'45px'}
                            textAlign={'center'}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.target.blur();
                                    if (matchNumber) {
                                        getTeams();
                                    }
                                }
                            }}
                            enterKeyHint='search'
                            _focus={{
                                outline: 'none',
                            }}
                            borderRadius={'5px'}
                            placeholder='Match Number'
                        />
                    </NumberInput>
                ) : null}
                {matchType.value === 'q' || matchType.value === 'f' || matchType === '' ? null : (
                    <Button _focus={{ outline: 'none' }} colorScheme={tieBreaker ? 'green' : 'gray'} onClick={() => setTieBreaker(!tieBreaker)}>
                        Tie
                    </Button>
                )}
            </HStack>
            <Button marginBottom={'10px'} _focus={{ outline: 'none' }} disabled={!matchNumber} onClick={() => getTeams()}>
                Search
            </Button>
            {fetchingTeams && (
                <Center>
                    <Spinner></Spinner>
                </Center>
            )}
            {!fetchingTeams && teams}
        </Box>
    );
}

export default MatchAnalystPage;
