import { useQuery } from '@apollo/client';
import { ChevronDownIcon, WarningIcon } from '@chakra-ui/icons';
import { Box, Button, Center, Grid, GridItem, IconButton, Input, Menu, MenuButton, MenuItem, MenuList, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Spinner, Text } from '@chakra-ui/react';
import { React, useEffect, useState } from 'react';
import { GET_EVENTS_KEYS_NAMES, GET_EVENTS_MATCHFORMS } from '../graphql/queries';
import { sortMatches, sortRegisteredEvents } from '../util/helperFunctions';
import { MdOutlineDoNotDisturbAlt } from 'react-icons/md';
import MatchesMemo from '../components/MatchesMemo';

function MatchesPage() {
    const [error, setError] = useState(null);
    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '' });
    const [focusedEvent, setFocusedEvent] = useState('');
    const [matchFilter, setMatchFilter] = useState('');
    const [teamFilter, setTeamFilter] = useState('');
    const [scouterFilter, setScouterFilter] = useState('');
    const [matchFormFilter, setMatchFormFilter] = useState(0);
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [matchListVersion, setMatchListVersion] = useState(0);

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

    const {
        loading: loadingMatchForms,
        error: matchFormsError,
        data: { getEventsMatchForms: matchForms } = {},
    } = useQuery(GET_EVENTS_MATCHFORMS, {
        skip: currentEvent.key === '',
        fetchPolicy: 'network-only',
        variables: {
            eventKey: currentEvent.key,
        },
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, could not retrieve match forms');
        },
    });

    useEffect(() => {
        let newMatches = [];
        if (matchForms) {
            for (let i = 0; i < matchForms.length; i++) {
                let match = matchForms[i];
                if (matchFormFilter === 1 && !match.followUp) {
                    continue;
                } else if (matchFormFilter === 2 && !match.noShow) {
                    continue;
                }
                if (
                    (matchFilter === '' || match.matchNumber.match(new RegExp(`^${matchFilter}`, 'gim'))) &&
                    (teamFilter === '' || match.teamNumber.toString().match(new RegExp(`^${teamFilter}`, 'gim'))) &&
                    (scouterFilter === '' || match.scouter.match(new RegExp(`^${scouterFilter}`, 'gim')))
                ) {
                    newMatches.push(matchForms[i]);
                }
            }
            newMatches = sortMatches(newMatches);
        }
        setFilteredMatches(newMatches);
        setMatchListVersion((prevVersion) => prevVersion + 1);
    }, [matchForms, matchFilter, matchFormFilter, scouterFilter, teamFilter]);

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
        <Box margin={'0 auto'} width={{ base: '90%', md: '66%', lg: '66%' }}>
            <IconButton
                position={'absolute'}
                right={'10px'}
                top={'95px'}
                onClick={() => setMatchFormFilter(matchFormFilter === 2 ? 0 : matchFormFilter + 1)}
                icon={matchFormFilter === 2 ? <MdOutlineDoNotDisturbAlt /> : <WarningIcon />}
                colorScheme={matchFormFilter === 0 ? 'black' : matchFormFilter === 1 ? 'yellow' : 'red'}
                variant={matchFormFilter !== 0 ? 'solid' : 'outline'}
                _focus={{ outline: 'none' }}
                size='sm'
            />
            <Center marginBottom={'25px'}>
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
            {loadingMatchForms || (matchFormsError && error !== false) ? (
                <Center>
                    <Spinner></Spinner>
                </Center>
            ) : matchForms.length > 0 ? (
                <Box marginBottom={'25px'}>
                    <Grid borderTop={'1px solid black'} backgroundColor={'gray.300'} templateColumns='2fr 1fr 1fr 1fr' gap={'5px'}>
                        <GridItem padding={'10px 0px 10px 0px'} textAlign={'center'}>
                            <Input
                                value={matchFilter}
                                onChange={(event) => setMatchFilter(event.target.value)}
                                borderColor={'gray.600'}
                                placeholder='Match #'
                                _placeholder={{ color: 'black', opacity: '0.75' }}
                                _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px', borderColor: 'black', width: 'max(80%, 100px)' }}
                                _hover={{ borderColor: 'black' }}
                                w={'80%'}
                                pos={'relative'}
                                top={'50%'}
                                transform={'translateY(-50%)'}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        event.target.blur();
                                    }
                                }}
                                enterKeyHint='done'
                            />
                        </GridItem>
                        <GridItem padding={'0px 0px 0px 0px'} _focus={{ zIndex: 1 }} textAlign={'center'}>
                            <Input
                                value={teamFilter}
                                onChange={(event) => setTeamFilter(event.target.value)}
                                borderColor={'gray.600'}
                                placeholder='Team #'
                                margin={'0 auto'}
                                _placeholder={{ color: 'black', opacity: '0.75' }}
                                _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px', borderColor: 'black', width: 'max(80%, 90px)', backgroundColor: 'gray.300', zIndex: 1 }}
                                _hover={{ borderColor: 'black' }}
                                w={'80%'}
                                pos={'relative'}
                                top={'50%'}
                                transform={'translateY(-50%)'}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        event.target.blur();
                                    }
                                }}
                                enterKeyHint='done'
                            />
                        </GridItem>
                        <GridItem position={'relative'} _focus={{ zIndex: 1 }} padding={'0px 0px 0px 0px'} textAlign={'center'}>
                            <Input
                                value={scouterFilter}
                                onChange={(event) => setScouterFilter(event.target.value)}
                                borderColor={'gray.600'}
                                placeholder='Scouter'
                                _placeholder={{ color: 'black', opacity: '0.75' }}
                                _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px', borderColor: 'black', width: 'max(80%, 110px)', backgroundColor: 'gray.300', zIndex: 1 }}
                                _hover={{ borderColor: 'black' }}
                                w={'80%'}
                                pos={'relative'}
                                top={'50%'}
                                transform={'translateY(-50%)'}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        event.target.blur();
                                    }
                                }}
                                enterKeyHint='done'
                            />
                        </GridItem>
                        <GridItem padding={'0px 0px 0px 0px'} _focus={{ zIndex: 1 }} textAlign={'center'}>
                            <Popover flip={true} placement='auto'>
                                <PopoverTrigger>
                                    <Text w='fit-content' margin={'0 auto'} cursor={'help'} pos={'relative'} fontSize={'20px'} top={'50%'} transform={'translateY(-50%)'}>
                                        🐯?
                                    </Text>
                                </PopoverTrigger>
                                <PopoverContent maxWidth={'50vw'} _focus={{ outline: 'none' }}>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverHeader color='black' fontSize='md' fontWeight='bold'>
                                        Match Filter Rules
                                    </PopoverHeader>
                                    <PopoverBody>
                                        Quals = qm&lt;#&gt;
                                        <br />
                                        Quarters = qf&lt;#&gt;m&lt;#&gt;
                                        <br />
                                        Semis = sf&lt;#&gt;m&lt;#&gt;
                                        <br />
                                        Finals = f1m&lt;#&gt;
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </GridItem>
                    </Grid>
                    <MatchesMemo matches={filteredMatches} currentEvent={currentEvent} version={matchListVersion}></MatchesMemo>
                </Box>
            ) : (
                <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                    No Match Data For This Event
                </Box>
            )}
        </Box>
    );
}

export default MatchesPage;
