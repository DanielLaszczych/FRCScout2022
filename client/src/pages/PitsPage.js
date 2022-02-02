import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import {
    Button,
    Center,
    Box,
    Grid,
    GridItem,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Spinner,
    Text,
    IconButton,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
} from '@chakra-ui/react';
import { GET_EVENT, GET_EVENTS_KEYS_NAMES, GET_EVENTS_PITFORMS } from '../graphql/queries';
import { CheckCircleIcon, ChevronDownIcon, EditIcon, WarningTwoIcon } from '@chakra-ui/icons';
import { sortRegisteredEvents } from '../util/helperFunctions';

function PitPage() {
    const [error, setError] = useState(null);
    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '' });
    const [focusedEvent, setFocusedEvent] = useState('');

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
        loading: loadingPitForms,
        error: pitFormsError,
        data: { getEventsPitForms: pitForms } = {},
    } = useQuery(GET_EVENTS_PITFORMS, {
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

    const {
        loading: loadingEvent,
        error: eventError,
        data: { getEvent: event } = {},
    } = useQuery(GET_EVENT, {
        skip: currentEvent.key === '',
        fetchPolicy: 'network-only',
        variables: {
            key: currentEvent.key,
        },
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, check console for logs');
        },
    });

    function getPitFormStatusIcon(teamName) {
        let pitForm = null;
        for (const pitFormData of pitForms) {
            if (pitFormData.teamName === teamName) {
                pitForm = pitFormData;
                break;
            }
        }
        if (pitForm === null) {
            return <EditIcon />;
        } else if (pitForm.followUp) {
            return <WarningTwoIcon />;
        } else {
            return <CheckCircleIcon />;
        }
    }

    function getPitFormStatusColor(teamName) {
        let pitForm = null;
        for (const pitFormData of pitForms) {
            if (pitFormData.teamName === teamName) {
                pitForm = pitFormData;
                break;
            }
        }
        if (pitForm === null) {
            return 'gray';
        } else if (pitForm.followUp) {
            return 'yellow';
        } else {
            return 'green';
        }
    }

    function getPitFormScouter(teamName) {
        for (const pitFormData of pitForms) {
            if (pitFormData.teamName === teamName) {
                let nameArr = pitFormData.scouter.split(' ');
                return nameArr[0] + ' ' + nameArr[1].charAt(0) + '.';
            }
        }
        return 'N/A';
    }

    function getPitFormFollowUpComment(teamName) {
        for (const pitFormData of pitForms) {
            if (pitFormData.teamName === teamName) {
                return pitFormData.followUpComment;
            }
        }
        return 'No Comment';
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
        <Box margin={'0 auto'} width={{ base: '90%', md: '66%', lg: '66%' }}>
            <Center marginBottom={'25px'}>
                <Menu placement='auto'>
                    <MenuButton onClick={() => setFocusedEvent('')} _focus={{ outline: 'none' }} textOverflow={'ellipsis'} whiteSpace={'nowrap'} overflow={'hidden'} textAlign={'center'} as={Button} rightIcon={<ChevronDownIcon />}>
                        {currentEvent.name}
                    </MenuButton>
                    <MenuList textAlign={'center'}>
                        {sortRegisteredEvents(events).map((eventItem) => (
                            <MenuItem
                                _focus={{ backgroundColor: 'none' }}
                                onMouseEnter={() => setFocusedEvent(eventItem.name)}
                                backgroundColor={(currentEvent.name === eventItem.name && focusedEvent === '') || focusedEvent === eventItem.name ? 'gray.100' : 'none'}
                                maxW={'75vw'}
                                key={eventItem.key}
                                onClick={() => setCurrentEvent({ name: eventItem.name, key: eventItem.key })}
                            >
                                <Text margin={'0 auto'}>{eventItem.name}</Text>
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </Center>
            {loadingPitForms || loadingEvent || ((pitFormsError || eventError) && error !== false) ? (
                <Center>
                    <Spinner></Spinner>
                </Center>
            ) : (
                <Box paddingBottom={'25px'}>
                    {event.teams
                        .sort((a, b) => a.number - b.number)
                        .map((team, index) => (
                            <Grid borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} key={team.key} templateColumns='1fr 2fr 1fr 1fr' gap={'5px'}>
                                <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {team.number}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {team.name}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {getPitFormScouter(team.name)}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'10px 0px 10px 0px'} marginRight={'10px'} marginLeft={'10px'} textAlign={'center'}>
                                    {getPitFormStatusColor(team.name) !== 'yellow' ? (
                                        <IconButton icon={getPitFormStatusIcon(team.name)} colorScheme={getPitFormStatusColor(team.name)} _focus={{ outline: 'none' }} size='sm' as={Link} to={`/pitForm/${currentEvent.key}/${team.number}`} />
                                    ) : (
                                        <Popover flip={false} placement='bottom'>
                                            <PopoverTrigger>
                                                <IconButton icon={getPitFormStatusIcon(team.name)} colorScheme={getPitFormStatusColor(team.name)} _focus={{ outline: 'none' }} size='sm' />
                                            </PopoverTrigger>
                                            <PopoverContent maxWidth={'50vw'} _focus={{ outline: 'none' }}>
                                                <PopoverArrow />
                                                <PopoverCloseButton />
                                                <PopoverHeader color='black' fontSize='md' fontWeight='bold'>
                                                    Follow Up Comment
                                                </PopoverHeader>
                                                <PopoverBody maxHeight={'125px'} overflowY={'auto'}>
                                                    <Text>{getPitFormFollowUpComment(team.name)}</Text>
                                                </PopoverBody>
                                                <PopoverFooter>
                                                    <Button _focus={{ outline: 'none' }} size='sm' as={Link} to={`/pitForm/${currentEvent.key}/${team.number}`}>
                                                        Go To
                                                    </Button>
                                                </PopoverFooter>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                </GridItem>
                            </Grid>
                        ))}
                </Box>
            )}
        </Box>
    );
}

export default PitPage;
