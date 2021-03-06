import { createRef, React, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Center, Box, Grid, GridItem, Text, Flex, Circle, Spinner, IconButton, VStack, Modal, useDisclosure, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useToast } from '@chakra-ui/react';
import { TransitionGroup } from 'react-transition-group';
import CSSTransition from '../components/CSSTransition';
import { GET_EVENTS_KEYS_NAMES } from '../graphql/queries';
import { CREATE_EVENT, REMOVE_EVENT, SET_CURRENT_EVENT } from '../graphql/mutations';
import { ArrowUpIcon, EditIcon } from '@chakra-ui/icons';
import { year } from '../util/constants';
import '../stylesheets/adminstyle.css';
import { sortBlueAllianceEvents, sortRegisteredEvents } from '../util/helperFunctions';
import TBAEventsMemo from '../components/TBAEventsMemo';
import { v4 as uuidv4 } from 'uuid';

function AdminPage() {
    const linkRef = useRef();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [error, setError] = useState(null);
    const [version, setVersion] = useState(0);
    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '' });
    const [focusedEvent, setFocusedEvent] = useState({ name: '', key: '' });
    const [changingCurrentEvent, setChangingCurrentEvent] = useState(false);
    const [setupDone, setSetUpDone] = useState(false);
    const [position, setPosition] = useState(0);
    const [eventTypes, setEventTypes] = useState([
        { name: 'Week 1', events: [], count: 0, ref: createRef(), id: uuidv4() },
        { name: 'Week 2', events: [], count: 0, ref: createRef(), id: uuidv4() },
        { name: 'Week 3', events: [], count: 0, ref: createRef(), id: uuidv4() },
        { name: 'Week 4', events: [], count: 0, ref: createRef(), id: uuidv4() },
        { name: 'Week 5', events: [], count: 0, ref: createRef(), id: uuidv4() },
        { name: 'Week 6', events: [], count: 0, ref: createRef(), id: uuidv4() },
        { name: 'Week 7', events: [], count: 0, ref: createRef(), id: uuidv4() },
        { name: 'Championship', events: [], count: 0, ref: createRef(), id: uuidv4() },
        { name: 'Preseason', events: [], count: 0, ref: createRef(), id: uuidv4() },
        { name: 'Offseason', events: [], count: 0, ref: createRef(), id: uuidv4() },
    ]);
    const [events, setEvents] = useState(false);
    const [mutatingEventKey, setMutatingEventKey] = useState(null);

    const listenToScroll = () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        // const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = winScroll;
        setPosition(scrolled);
    };

    function findPos(obj, curTop) {
        if (!obj) {
            return null;
        }
        let curtop = curTop;
        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop;
            } while ((obj = obj.offsetParent));
            return curtop;
        }
    }

    function handleScrollAction(ref) {
        let targetEle = ref.current;
        let curTop = window.innerWidth <= 285 ? -175 : -100;
        window.scrollTo({ top: findPos(targetEle, curTop), behavior: 'smooth' });
    }

    useEffect(() => {
        window.addEventListener('scroll', listenToScroll);

        return () => window.removeEventListener('scroll', listenToScroll);
    }, []);

    const { loading: loadingEventKeys, error: eventKeysError } = useQuery(GET_EVENTS_KEYS_NAMES, {
        fetchPolicy: 'network-only',
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, could not retrieve registered events');
        },
        onCompleted({ getEvents: events }) {
            setEvents(sortRegisteredEvents(events));
            let currentEvent = events.find((event) => event.currentEvent);
            if (currentEvent === undefined) {
                setCurrentEvent({ name: 'None', key: 'None' });
                setFocusedEvent({ name: 'None', key: 'None' });
            } else {
                setCurrentEvent({ name: currentEvent.name, key: currentEvent.key });
                setFocusedEvent({ name: currentEvent.name, key: currentEvent.key });
            }
            fetch(`/blueAlliance/getEventsCustom/${year}`)
                .then((response) => response.json())
                .then((data) => {
                    if (!data.Error) {
                        let filteredData = data.filter((event) => !events.some((e) => e.name === event.name));
                        setEventTypes((prevEventTypes) =>
                            prevEventTypes.map((eventType) => {
                                let events = filterEvents(eventType.name, filteredData);
                                return { ...eventType, events: events, count: events.length };
                            })
                        );
                        setVersion((prevVersion) => prevVersion + 1);
                        setSetUpDone(true);
                    } else {
                        setError(data.Error);
                    }
                })
                .catch((error) => {
                    setError(error);
                });
        },
    });

    function filterEvents(eventTypeName, events) {
        let filteredEvents = [];
        if (eventTypeName.substring(0, 4) === 'Week') {
            let week = parseInt(eventTypeName.substring(5));
            filteredEvents = events.filter((event) => (event.week !== null ? event.week + 1 === week : false));
        } else if (eventTypeName === 'Championship') {
            filteredEvents = events.filter((event) => event.event_type_string === 'Championship Division' || event.event_type_string === 'Championship Finals');
        } else if (eventTypeName === 'Preseason') {
            filteredEvents = events.filter((event) => event.event_type_string === 'Preseason');
        } else {
            filteredEvents = events.filter((event) => event.event_type_string === 'Offseason');
        }
        return sortBlueAllianceEvents(filteredEvents);
    }

    const [createEvent] = useMutation(CREATE_EVENT, {
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            toast({
                title: 'Apollo Error',
                description: 'Event was not able to be added',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setMutatingEventKey(null);
        },
        onCompleted({ createEvent: createdEvent }) {
            toast({
                title: 'Event was Added',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setEventTypes((prevEventTypes) =>
                prevEventTypes.map((eventType) => {
                    if (createdEvent.eventType === eventType.name) {
                        let filteredEvents = eventType.events.filter((event) => event.name !== createdEvent.name);
                        return { ...eventType, events: filteredEvents, count: filteredEvents.length };
                    } else {
                        return eventType;
                    }
                })
            );
            setVersion((prevVersion) => prevVersion + 1);
            setTimeout(() => {
                setMutatingEventKey(null);
                setEvents((prevEvents) => sortRegisteredEvents([...prevEvents, createdEvent]));
            }, 300);
        },
    });

    function handleAddEvent(name, year, week, eventType, key, startDate, endDate) {
        setMutatingEventKey(key);
        fetch(`/blueAlliance/event/${key}/teams/simple`)
            .then((response) => response.json())
            .then((data) => {
                if (!data.Error) {
                    let teams = data.map((team) => {
                        return { name: team.nickname, number: team.team_number, key: team.key };
                    });
                    let event = {
                        name: name,
                        year: year,
                        week: week,
                        eventType: eventType,
                        startDate: startDate,
                        endDate: endDate,
                        key: key,
                        teams: teams,
                    };
                    createEvent({
                        variables: {
                            eventInput: event,
                        },
                    });
                } else {
                    console.log(data.Error);
                    toast({
                        title: 'Blue Alliance Error',
                        description: 'Event was not able to be added',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                    });
                    setMutatingEventKey(null);
                }
            })
            .catch((error) => {
                console.log(error);
                toast({
                    title: 'Blue Alliance Error',
                    description: 'Event was not able to be added',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                setMutatingEventKey(null);
            });
    }

    const [removeEvent] = useMutation(REMOVE_EVENT, {
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            toast({
                title: 'Apollo Error',
                description: 'Event was not able to be removed',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setMutatingEventKey(null);
        },
        onCompleted({ removeEvent: removedEvent }) {
            toast({
                title: 'Event was Removed',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            if (removedEvent.key === currentEvent.key) {
                setCurrentEvent({ name: 'None', key: 'None' });
                setFocusedEvent({ name: 'None', key: 'None' });
            }
            setEvents((prevEvents) => prevEvents.filter((event) => event.name !== removedEvent.name));
            setMutatingEventKey(null);
            setTimeout(() => {
                setEventTypes((prevEventTypes) =>
                    prevEventTypes.map((eventType) => {
                        if (removedEvent.eventType === eventType.name) {
                            let addedEvent = {
                                name: removedEvent.name,
                                key: removedEvent.key,
                                week: removedEvent.week,
                                event_type_string: removedEvent.eventType,
                                start_date: removedEvent.startDate,
                                end_date: removedEvent.endDate,
                                year: removedEvent.year,
                            };
                            let newEvents = sortBlueAllianceEvents([...eventType.events, addedEvent]);
                            return { ...eventType, events: newEvents, count: eventType.count + 1 };
                        } else {
                            return eventType;
                        }
                    })
                );
                setVersion((prevVersion) => prevVersion + 1);
            }, 300);
        },
    });

    function handleRemoveEvent(key) {
        setMutatingEventKey(key);
        removeEvent({
            variables: {
                key: key,
            },
        });
    }

    const [setCurrentEventMutation] = useMutation(SET_CURRENT_EVENT, {
        onError(err) {
            if (err.message === 'Error: No current events') {
                toast({
                    title: 'Current Event Changed',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
                setCurrentEvent({ name: 'None', key: 'None' });
                setFocusedEvent({ name: 'None', key: 'None' });
                setChangingCurrentEvent(false);
            } else {
                console.log(JSON.stringify(err, null, 2));
                toast({
                    title: 'Apollo Error',
                    description: 'Current event was not able to changed',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                setFocusedEvent({ name: currentEvent.name, key: currentEvent.key });
                setChangingCurrentEvent(false);
            }
        },
        onCompleted({ setCurrentEvent: currentEvent }) {
            toast({
                title: 'Current Event Changed',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setCurrentEvent({ name: currentEvent.name, key: currentEvent.key });
            setFocusedEvent({ name: currentEvent.name, key: currentEvent.key });
            setChangingCurrentEvent(false);
        },
    });

    function handleSetCurrentEvent(key) {
        setChangingCurrentEvent(true);
        setCurrentEventMutation({
            variables: {
                key: key,
            },
        });
    }

    if (error) {
        return (
            <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                {error}
            </Box>
        );
    }

    if (loadingEventKeys || (eventKeysError && error !== false) || !setupDone) {
        return (
            <Center>
                <Spinner></Spinner>
            </Center>
        );
    }

    return (
        <Box margin={'0 auto'} width={{ base: '90%', md: '66%', lg: '66%' }}>
            <Modal lockFocusAcrossFrames={true} closeOnEsc={true} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay>
                    <ModalContent margin={0} w={{ base: '75%', md: '40%', lg: '30%' }} top='25%'>
                        <ModalHeader color='black' fontSize='lg' fontWeight='bold'>
                            Select an Event
                        </ModalHeader>
                        <ModalBody maxHeight={'250px'} overflowY={'auto'}>
                            <VStack spacing={'10px'}>
                                <Button colorScheme={focusedEvent.key === 'None' ? 'green' : 'gray'} onClick={() => setFocusedEvent({ name: 'None', key: 'None' })} _focus={{ outline: 'none' }}>
                                    None
                                </Button>
                                {events.map((event) => (
                                    <Button
                                        key={event.key}
                                        minH={'40px'}
                                        height={'max-content'}
                                        paddingBottom={'5px'}
                                        paddingTop={'5px'}
                                        onClick={() => setFocusedEvent({ name: event.name, key: event.key })}
                                        colorScheme={focusedEvent.key === event.key ? 'green' : 'gray'}
                                        _focus={{ outline: 'none' }}
                                        style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                                    >
                                        {event.name}
                                    </Button>
                                ))}
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={onClose} _focus={{ outline: 'none' }}>
                                Cancel
                            </Button>
                            <Button
                                colorScheme='blue'
                                ml={3}
                                _focus={{ outline: 'none' }}
                                onClick={() => {
                                    handleSetCurrentEvent(focusedEvent.key);
                                    onClose();
                                }}
                            >
                                Confirm
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            </Modal>
            {position > findPos(linkRef.current, window.innerWidth <= 285 ? -150 : -75) ? (
                <Circle
                    backgroundColor={'gray.200'}
                    zIndex={2}
                    position={'fixed'}
                    cursor={'pointer'}
                    onClick={() => {
                        // handleScrollAction(linkRef);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    bottom={'2%'}
                    right={'2%'}
                    padding={'10px'}
                    borderRadius={'50%'}
                    border={'2px solid black'}
                >
                    <ArrowUpIcon fontSize={'150%'} />
                </Circle>
            ) : null}
            <Box marginBottom={'25px'}>
                <h2 style={{ fontWeight: '500', fontSize: '30px', lineHeight: '1.1' }}>Current Event: {currentEvent.name}</h2>
                {changingCurrentEvent ? <Spinner></Spinner> : <IconButton _focus={{ outline: 'none' }} size='sm' icon={<EditIcon />} onClick={onOpen} />}
            </Box>
            <Box margin='0 auto' marginBottom={'25px'}>
                <Box marginBottom={'10px'}>
                    <h2 style={{ fontWeight: '500', fontSize: '30px', lineHeight: '1.1' }}>
                        Registered Events <small style={{ fontSize: '65%', color: '#777', lineHeight: '1' }}>{events.length} Events</small>
                    </h2>
                </Box>
                <TransitionGroup>
                    {events.map((event, index) => (
                        <CSSTransition key={event.key} timeout={500} classNames='shrink'>
                            <Grid minHeight={'61px'} borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} templateColumns='2fr 1fr' gap={'15px'}>
                                <GridItem marginLeft={'5px'} padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {event.name}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'10px 0px 10px 0px'} textAlign={'center'}>
                                    {mutatingEventKey === event.key ? (
                                        <Box marginTop={'8px'} minW={'110px'}>
                                            <Spinner></Spinner>
                                        </Box>
                                    ) : (
                                        <Button _focus={{ outline: 'none' }} disabled={mutatingEventKey !== null} onClick={() => handleRemoveEvent(event.key)} size={'md'} marginLeft={'10px'} marginRight={'10px'}>
                                            Remove
                                        </Button>
                                    )}
                                </GridItem>
                            </Grid>
                        </CSSTransition>
                    ))}
                </TransitionGroup>
            </Box>
            <Center>
                <Flex flexWrap={'wrap'} marginBottom={'25px'} justifyContent={'center'}>
                    {eventTypes.map((eventType) => (
                        <Button key={eventType.id} _focus={{ outline: 'none' }} ref={eventType.name === 'Week 1' ? linkRef : null} maxW={'125px'} minW={'125px'} margin={'8px'} onClick={() => handleScrollAction(eventType.ref)}>
                            {eventType.name}
                        </Button>
                    ))}
                </Flex>
            </Center>
            <Box>
                {eventTypes.map((eventType) => (
                    <TBAEventsMemo key={eventType.id} eventType={eventType} mutatingEventKey={mutatingEventKey} handleAddEvent={handleAddEvent} version={version}></TBAEventsMemo>
                ))}
            </Box>
        </Box>
    );
}

export default AdminPage;
