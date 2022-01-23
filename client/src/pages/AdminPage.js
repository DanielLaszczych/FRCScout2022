import { React, useContext, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Center, Box, Grid, GridItem, Text, Flex, Circle, Spinner } from '@chakra-ui/react';
import { GET_EVENTS_KEYS_NAMES } from '../graphql/queries';
import { CREATE_EVENT } from '../graphql/mutations';
import { ArrowUpIcon } from '@chakra-ui/icons';
import { year } from '../util/constants';

let weeks = [1, 2, 3, 4, 5, 6, 7, null];

function AdminPage() {
    const refs = useRef([]);

    const [error, setError] = useState(null);
    const [setupDone, setSetUpDone] = useState(false);
    const [position, setPosition] = useState(0);
    const [events, setEvents] = useState(false);
    const [blueAllianceEvents, setBlueAllianceEvents] = useState([]);

    const addToRefs = (el, name) => {
        if (!refs.current[name]) {
            refs.current[name] = el;
        }
    };

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
        var curtop = -20;
        if (obj.offsetParent) {
            do {
                curtop += obj.offsetTop;
            } while ((obj = obj.offsetParent));
            return [curtop];
        }
    }

    function handleScrollAction(id) {
        let targetEle = refs.current[id];
        window.scrollTo(0, findPos(targetEle));
    }

    useEffect(() => {
        window.addEventListener('scroll', listenToScroll);

        return () => window.removeEventListener('scroll', listenToScroll);
    }, []);

    useEffect(() => {
        if (setupDone && events) {
            setBlueAllianceEvents((prevBlueAllianceEvents) => {
                let newEvents = prevBlueAllianceEvents.filter((event) => !events.some((e) => e.name === event.name));
                return [...newEvents];
            });
        }
    }, [events, setupDone]);

    const { loading: loadingEventKeys, error: eventKeysError } = useQuery(GET_EVENTS_KEYS_NAMES, {
        fetchPolicy: 'network-only',
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
        },
        onCompleted({ getEvents: events }) {
            setEvents(events);
            fetch(`/blueAlliance/getEventsCustom/${year}`)
                .then((response) => response.json())
                .then((data) => {
                    if (!data.Error) {
                        let filteredData = data.filter((event) => !events.some((e) => e.name === event.name));
                        setBlueAllianceEvents(filteredData);
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

    const [createEvent] = useMutation(CREATE_EVENT, {
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, check console for logs');
        },
    });

    function handleAddEvent(name, year, key) {
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
                        key: key,
                        teams: teams,
                    };
                    setEvents((prevEvents) => [...prevEvents, event]);
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

    if (error !== null) {
        return <Center>{error}</Center>;
    }

    if (loadingEventKeys || eventKeysError || !setupDone) {
        return (
            <Center>
                <Spinner></Spinner>
            </Center>
        );
    }

    return (
        <Box margin={'0 auto'} width={{ base: '90%', md: '66%', lg: '66%' }}>
            {position > findPos(refs.current['links']) ? (
                <Circle backgroundColor={'gray.200'} zIndex={2} position={'fixed'} cursor={'pointer'} onClick={() => handleScrollAction('links')} left={'10px'} padding={'5px'} borderRadius={'50%'} border={'2px solid black'}>
                    <ArrowUpIcon fontSize={'150%'} />
                </Circle>
            ) : null}
            {events.length > 0 ? (
                <Box margin='0 auto' marginBottom={'25px'}>
                    <Center marginBottom={'10px'}>
                        <Text fontSize={'120%'}>Registered Events</Text>
                    </Center>
                    {events
                        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                        .map((event, index) => (
                            <Grid borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} key={index} templateColumns='2fr 1fr' gap={'15px'}>
                                <GridItem marginLeft={'5px'} padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {event.name}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'10px 0px 10px 0px'} textAlign={'center'}>
                                    <Button _focus={{ outline: 'none' }} disabled={true} size={'md'} marginLeft={'10px'} marginRight={'10px'}>
                                        Remove
                                    </Button>
                                </GridItem>
                            </Grid>
                        ))}
                </Box>
            ) : null}

            <Center>
                <Flex flexWrap={'wrap'} marginBottom={'25px'} justifyContent={'center'}>
                    {weeks.map((week, index) => (
                        <Button _focus={{ outline: 'none' }} ref={week === 1 ? (el) => addToRefs(el, 'links') : null} maxW={'125px'} minW={'125px'} margin={'8px'} key={index} onClick={() => handleScrollAction(week || 'Championship')}>
                            {week ? `Week ${week}` : 'Championship'}
                        </Button>
                    ))}
                </Flex>
            </Center>
            <Box>
                {weeks.map((week, index) => (
                    <Box key={index} margin='0 auto' marginBottom={'25px'}>
                        <Center marginBottom={'10px'}>
                            <Text ref={(el) => addToRefs(el, week || 'Championship')} fontSize={'120%'}>
                                {week ? `Week ${week}` : 'Championship'}
                            </Text>
                        </Center>
                        {blueAllianceEvents
                            .filter((event) => (event.week !== null ? event.week + 1 === week : event.week === week))
                            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                            .map((event, index) => (
                                <Grid borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} key={event.key} templateColumns='2fr 1fr' gap={'15px'}>
                                    <GridItem marginLeft={'5px'} padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                        <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                            {event.name}
                                        </Text>
                                    </GridItem>
                                    <GridItem padding={'10px 0px 10px 0px'} textAlign={'center'}>
                                        <Button _focus={{ outline: 'none' }} size={'md'} onClick={() => handleAddEvent(event.name, event.year, event.key)}>
                                            Add
                                        </Button>
                                    </GridItem>
                                </Grid>
                            ))}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export default AdminPage;
