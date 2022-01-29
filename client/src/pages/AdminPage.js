import { createRef, React, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Center, Box, Grid, GridItem, Text, Flex, Circle, Spinner } from '@chakra-ui/react';
import { TransitionGroup } from 'react-transition-group';
import CSSTransition from '../components/CSSTransition';
import { GET_EVENTS_KEYS_NAMES } from '../graphql/queries';
import { CREATE_EVENT, REMOVE_EVENT } from '../graphql/mutations';
import { ArrowUpIcon } from '@chakra-ui/icons';
import { year } from '../util/constants';
import '../stylesheets/adminstyle.css';

function AdminPage() {
    const linkRef = useRef();

    const [error, setError] = useState(null);
    const [setupDone, setSetUpDone] = useState(false);
    const [position, setPosition] = useState(0);
    const [eventTypes, setEventTypes] = useState([
        { name: 'Week 1', events: [], count: 0, ref: createRef() },
        { name: 'Week 2', events: [], count: 0, ref: createRef() },
        { name: 'Week 3', events: [], count: 0, ref: createRef() },
        { name: 'Week 4', events: [], count: 0, ref: createRef() },
        { name: 'Week 5', events: [], count: 0, ref: createRef() },
        { name: 'Week 6', events: [], count: 0, ref: createRef() },
        { name: 'Week 7', events: [], count: 0, ref: createRef() },
        { name: 'Championship', events: [], count: 0, ref: createRef() },
        { name: 'Preseason', events: [], count: 0, ref: createRef() },
        { name: 'Offseason', events: [], count: 0, ref: createRef() },
    ]);
    const [events, setEvents] = useState(false);
    const [mutatingEventKey, setMutatingEventKey] = useState(null);

    const listenToScroll = () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        // const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = winScroll;
        setPosition(scrolled);
    };

    function findPos(obj) {
        if (!obj) {
            return null;
        }
        let curtop = -100;
        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop;
            } while ((obj = obj.offsetParent));
            return curtop;
        }
    }

    function handleScrollAction(ref) {
        let targetEle = ref.current;
        window.scrollTo({ top: findPos(targetEle), behavior: 'smooth' });
    }

    useEffect(() => {
        window.addEventListener('scroll', listenToScroll);

        return () => window.removeEventListener('scroll', listenToScroll);
    }, []);

    const { loading: loadingEventKeys, error: eventKeysError } = useQuery(GET_EVENTS_KEYS_NAMES, {
        fetchPolicy: 'network-only',
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, check console for logs');
        },
        onCompleted({ getEvents: events }) {
            setEvents(events);
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
        return filteredEvents.sort((a, b) => {
            let delta = new Date(a.start_date) - new Date(b.start_date);
            if (delta === 0) {
                delta = new Date(a.end_date) - new Date(b.end_date);
                if (delta === 0) {
                    delta = a.name.localeCompare(b.name);
                }
            }
            return delta;
        });
    }

    const [createEvent] = useMutation(CREATE_EVENT, {
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, check console for logs');
        },
        onCompleted({ createEvent: createdEvent }) {
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
            setTimeout(() => {
                setMutatingEventKey(null);
                setEvents((prevEvents) => [...prevEvents, createdEvent]);
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
                    setError(data.Error);
                }
            })
            .catch((error) => {
                setError(error);
            });
    }

    const [removeEvent] = useMutation(REMOVE_EVENT, {
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, check console for logs');
        },
        onCompleted({ removeEvent: removedEvent }) {
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
                            let newEvents = [...eventType.events, addedEvent].sort((a, b) => {
                                let delta = new Date(a.start_date) - new Date(b.start_date);
                                if (delta === 0) {
                                    delta = new Date(a.end_date) - new Date(b.end_date);
                                    if (delta === 0) {
                                        delta = a.name.localeCompare(b.name);
                                    }
                                }
                                return delta;
                            });
                            return { ...eventType, events: newEvents, count: eventType.count + 1 };
                        } else {
                            return eventType;
                        }
                    })
                );
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
            {position > findPos(linkRef.current) ? (
                <Circle backgroundColor={'gray.200'} zIndex={2} position={'fixed'} cursor={'pointer'} onClick={() => handleScrollAction(linkRef)} bottom={'2%'} right={'2%'} padding={'10px'} borderRadius={'50%'} border={'2px solid black'}>
                    <ArrowUpIcon fontSize={'150%'} />
                </Circle>
            ) : null}
            <Box margin='0 auto' marginBottom={'25px'}>
                <Box marginBottom={'10px'}>
                    <h2 style={{ fontWeight: '500', fontSize: '30px', lineHeight: '1.1' }}>
                        Registered Events <small style={{ fontSize: '65%', color: '#777', lineHeight: '1' }}>{events.length} Events</small>
                    </h2>
                </Box>
                <TransitionGroup>
                    {events
                        .sort((a, b) => {
                            let delta = new Date(a.startDate) - new Date(b.startDate);
                            if (delta === 0) {
                                delta = new Date(a.endDate) - new Date(b.endDate);
                                if (delta === 0) {
                                    delta = a.name.localeCompare(b.name);
                                }
                            }
                            return delta;
                        })
                        .map((event, index) => (
                            <CSSTransition key={event.key} timeout={500} classNames='shrink'>
                                <Grid minHeight={'61px'} borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} templateColumns='2fr 1fr' gap={'15px'}>
                                    <GridItem marginLeft={'5px'} padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                        <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                            {event.name}
                                        </Text>
                                    </GridItem>
                                    <GridItem padding={'10px 0px 10px 0px'} textAlign={'center'}>
                                        {mutatingEventKey === event.key ? (
                                            <Spinner marginTop={'8px'}></Spinner>
                                        ) : (
                                            <Button _focus={{ outline: 'none' }} onClick={() => handleRemoveEvent(event.key)} size={'md'} marginLeft={'10px'} marginRight={'10px'}>
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
                    {eventTypes.map((eventType, index) => (
                        <Button _focus={{ outline: 'none' }} ref={eventType.name === 'Week 1' ? linkRef : null} maxW={'125px'} minW={'125px'} margin={'8px'} key={index} onClick={() => handleScrollAction(eventType.ref)}>
                            {eventType.name}
                        </Button>
                    ))}
                </Flex>
            </Center>
            <Box>
                {eventTypes.map((eventType, index) => (
                    <Box key={index} margin='0 auto' marginBottom={'25px'}>
                        <Box marginBottom={'10px'}>
                            <h2 ref={eventType.ref} style={{ fontWeight: '500', fontSize: '30px', lineHeight: '1.1' }}>
                                {eventType.name} <small style={{ fontSize: '65%', color: '#777', lineHeight: '1' }}>{eventType.count} Events</small>
                            </h2>
                        </Box>
                        <TransitionGroup>
                            {eventType.events.map((event, index) => (
                                <CSSTransition key={event.key} timeout={500} classNames='shrink'>
                                    <Grid minHeight={'61px'} borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} templateColumns='2fr 1fr' gap={'15px'}>
                                        <GridItem marginLeft={'5px'} padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                            <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                                {event.name}
                                            </Text>
                                        </GridItem>
                                        <GridItem padding={'10px 0px 10px 0px'} textAlign={'center'}>
                                            {mutatingEventKey === event.key ? (
                                                <Spinner marginTop={'8px'}></Spinner>
                                            ) : (
                                                <Button _focus={{ outline: 'none' }} size={'md'} onClick={() => handleAddEvent(event.name, event.year, event.week, eventType.name, event.key, event.start_date, event.end_date)}>
                                                    Add
                                                </Button>
                                            )}
                                        </GridItem>
                                    </Grid>
                                </CSSTransition>
                            ))}
                        </TransitionGroup>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export default AdminPage;
