import { createRef, React, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/auth';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Center, Box, Grid, GridItem, Text, Flex, extendTheme, Circle } from '@chakra-ui/react';
import { GET_EVENTS_KEYS_NAMES } from '../graphql/queries';
import { CREATE_EVENT } from '../graphql/mutations';
import { ArrowUpIcon } from '@chakra-ui/icons';
import { createBreakpoints } from '@chakra-ui/theme-tools';

let weeks = [1, 2, 3, 4, 5, 6, 7, null];
let refs = null;

const breakpoints = createBreakpoints({
    sm: '320px',
    md: '768px',
    lg: '960px',
    xl: '1200px',
    '2xl': '1536px',
});

extendTheme({ breakpoints });

function AdminPage() {
    let navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [setupDone, setSetUpDone] = useState(false);
    const [position, setPosition] = useState(0);
    const [events, setEvents] = useState();
    const [blueAllianceEvents, setBlueAllianceEvents] = useState([]);

    const listenToScroll = () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
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
        let targetEle = refs[id].current;
        window.scrollTo(0, findPos(targetEle));
    }

    useEffect(() => {
        refs = {};
        for (const week of weeks) {
            refs[week || 'Championship'] = createRef();
        }
        refs['links'] = createRef();
        window.addEventListener('scroll', listenToScroll);

        return () => window.removeEventListener('scroll', listenToScroll);
    }, []);

    useEffect(() => {
        if (setupDone) {
            let filteredData = blueAllianceEvents.filter((event) => !events.some((e) => e.name === event.name));
            setBlueAllianceEvents(filteredData);
        }
    }, [events]);

    const { loading, error, data } = useQuery(GET_EVENTS_KEYS_NAMES, {
        skip: !user.admin,
        fetchPolicy: 'network-only',
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
        },
        onCompleted({ getEvents: events }) {
            setEvents(events);
            fetch(`https://www.thebluealliance.com/api/v3/events/2022?X-TBA-Auth-Key=VcTpa99nIEsT44AsrzSXFzdlS7efZ1wWCrnkMMFyBWQ3tXbp0KFRHSJTLhx96ukP`)
                .then((response) => response.json())
                .then((data) => {
                    let filteredData = data.filter((event) => !events.some((e) => e.name === event.name));
                    setBlueAllianceEvents(filteredData);
                    setSetUpDone(true);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        },
    });

    const [createEvent] = useMutation(CREATE_EVENT, {
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
        },
    });

    function handleAddEvent(name, year, key) {
        fetch(`https://www.thebluealliance.com/api/v3/event/${key}/teams/simple
?X-TBA-Auth-Key=VcTpa99nIEsT44AsrzSXFzdlS7efZ1wWCrnkMMFyBWQ3tXbp0KFRHSJTLhx96ukP`)
            .then((response) => response.json())
            .then((data) => {
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
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    return user.admin ? (
        setupDone ? (
            <Box margin={'0 auto'} width={{ base: '90%', md: '66%', lg: '66%' }}>
                {position > findPos(refs['links'].current) ? (
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
                    <Flex flexWrap={'wrap'} margin={'-10px'} marginBottom={'25px'} alignItems={'center'}>
                        {weeks.map((week, index) => (
                            <Button _focus={{ outline: 'none' }} ref={week === 1 ? refs['links'] : null} w={'25%'} flex={'1 1 160px'} margin={'10px'} key={index} onClick={() => handleScrollAction(week || 'Championship')}>
                                {week ? `Week ${week}` : 'Championship'}
                            </Button>
                        ))}
                    </Flex>
                </Center>
                <Box>
                    {weeks.map((week, index) => (
                        <Box key={index} margin='0 auto' marginBottom={'25px'}>
                            <Center marginBottom={'10px'}>
                                <Text ref={refs[week || 'Championship']} fontSize={'120%'}>
                                    {week ? `Week ${week}` : 'Championship'}
                                </Text>
                            </Center>
                            {blueAllianceEvents
                                .filter((event) => (event.week !== null ? event.week + 1 === week : event.week === week))
                                .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                                .map((event, index) => (
                                    <Grid borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} key={index} templateColumns='2fr 1fr' gap={'15px'}>
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
        ) : null
    ) : (
        <Center>You must be an admin</Center>
    );
}

export default AdminPage;
