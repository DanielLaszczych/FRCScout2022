import { useQuery } from '@apollo/client';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Button, Center, Grid, GridItem, Input, Menu, MenuButton, MenuItem, MenuList, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Spinner, Text } from '@chakra-ui/react';
import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import { GET_EVENTS_KEYS_NAMES, GET_EVENTS_MATCHFORMS } from '../graphql/queries';
import { convertMatchKeyToString, convertStationKeyToString, sortMatches, sortRegisteredEvents } from '../util/helperFunctions';

function MatchesPage() {
    const [error, setError] = useState(null);
    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '' });
    const [focusedEvent, setFocusedEvent] = useState('');
    const [matchFilter, setMatchFilter] = useState('');
    const [teamFilter, setTeamFilter] = useState('');
    const [scouterFilter, setScouterFilter] = useState('');

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
            setError('Apollo error, check console for logs');
        },
    });

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
            <Center marginBottom={'25px'}>
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
                                key={index}
                                onClick={() => setCurrentEvent({ name: eventItem.name, key: eventItem.key })}
                            >
                                <Text margin={'0 auto'}>{eventItem.name}</Text>
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
                <Box paddingBottom={'25px'}>
                    <Grid borderTop={'1px solid black'} backgroundColor={'gray.400'} templateColumns='2fr 1fr 1fr 1fr' gap={'5px'}>
                        <GridItem padding={'10px 0px 10px 0px'} textAlign={'center'}>
                            <Input
                                value={matchFilter}
                                onChange={(event) => setMatchFilter(event.target.value)}
                                borderColor={'black'}
                                placeholder='Match #'
                                _placeholder={{ color: 'black', opacity: '0.75' }}
                                _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                                w={'80%'}
                                pos={'relative'}
                                top={'50%'}
                                transform={'translateY(-50%)'}
                            />
                        </GridItem>
                        <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                            <Input
                                value={teamFilter}
                                onChange={(event) => setTeamFilter(event.target.value)}
                                borderColor={'black'}
                                placeholder='Team #'
                                _placeholder={{ color: 'black', opacity: '0.75' }}
                                _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                                w={'80%'}
                                pos={'relative'}
                                top={'50%'}
                                transform={'translateY(-50%)'}
                            />
                        </GridItem>
                        <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                            <Input
                                value={scouterFilter}
                                onChange={(event) => setScouterFilter(event.target.value)}
                                borderColor={'black'}
                                placeholder='Scouter Name'
                                _placeholder={{ color: 'black', opacity: '0.75' }}
                                _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                                w={'80%'}
                                pos={'relative'}
                                top={'50%'}
                                transform={'translateY(-50%)'}
                            />
                        </GridItem>
                        <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                            <Popover>
                                <PopoverTrigger>
                                    <Text w='fit-content' margin={'0 auto'} cursor={'help'} pos={'relative'} fontSize={'20px'} top={'50%'} transform={'translateY(-50%)'}>
                                        🐯?
                                    </Text>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverHeader>Match Filter Rules</PopoverHeader>
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
                    {sortMatches(
                        matchForms
                            .filter((match) => match.matchNumber.match(new RegExp(`^${matchFilter}`, 'gim')))
                            .filter((match) => match.teamNumber.toString().match(new RegExp(`^${teamFilter}`, 'gim')))
                            .filter((match) => match.scouter.match(new RegExp(`^${scouterFilter}`, 'gim')))
                    ).map((match, index) => (
                        <Grid borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} key={index} templateColumns='2fr 1fr 1fr 1fr' gap={'5px'}>
                            <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    {convertMatchKeyToString(match.matchNumber)} : {convertStationKeyToString(match.station)}
                                </Text>
                            </GridItem>
                            <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    {match.teamNumber}
                                </Text>
                            </GridItem>
                            <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    {`${match.scouter.split(' ')[0]}  ${match.scouter.split(' ')[1].charAt(0)}.`}
                                </Text>
                            </GridItem>
                            <GridItem padding={'10px 0px 10px 0px'} textAlign={'center'}>
                                <Button size='sm' as={Link} to={`/matchForm/${currentEvent.key}/${match.matchNumber}/${match.station}`}>
                                    Go To
                                </Button>
                            </GridItem>
                        </Grid>
                    ))}
                </Box>
            ) : (
                <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                    No Match Data For this Event
                </Box>
            )}
        </Box>
    );
}

export default MatchesPage;