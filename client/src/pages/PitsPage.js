import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Center, Box, Grid, GridItem, Menu, MenuButton, MenuList, MenuItem, Spinner, Text, extendTheme } from '@chakra-ui/react';
import { GET_EVENT, GET_EVENTS_KEYS_NAMES, GET_EVENT_PITFORMS } from '../graphql/queries';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { createBreakpoints } from '@chakra-ui/theme-tools';

const breakpoints = createBreakpoints({
    sm: '320px',
    md: '768px',
    lg: '960px',
    xl: '1200px',
    '2xl': '1536px',
});

extendTheme({ breakpoints });

function PitPage() {
    let navigate = useNavigate();

    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '' });

    const {
        loading: loadingEvents,
        error: eventsError,
        data: { getEvents: events } = {},
    } = useQuery(GET_EVENTS_KEYS_NAMES, {
        fetchPolicy: 'network-only',
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
        },
        onCompleted({ getEvents: events }) {
            if (events.length > 0) {
                setCurrentEvent({ name: events[0].name, key: events[0].key });
            }
        },
    });

    const {
        loading: loadingPitForms,
        error: pitFormsError,
        data: { getEventPitForms: pitforms } = {},
    } = useQuery(GET_EVENT_PITFORMS, {
        skip: currentEvent.key === '',
        fetchPolicy: 'network-only',
        variables: {
            eventKey: currentEvent.key,
        },
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
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
        },
    });

    function getPitFormStatus(teamName) {
        let pitform = null;
        for (const pitformData of pitforms) {
            if (pitformData.teamName === teamName) {
                pitform = pitformData;
                break;
            }
        }
        if (pitform === null) {
            return 'Not Started';
        } else if (pitform.followUp) {
            return 'Not Complete';
        } else {
            return 'Complete';
        }
    }

    if (loadingEvents) {
        return null;
    }

    if (events.length === 0) {
        return <Center>No events are registered</Center>;
    }

    return (
        <Box margin={'0 auto'} width={{ base: '90%', md: '66%', lg: '66%' }}>
            <Center marginBottom={'25px'}>
                <Menu>
                    <MenuButton _focus={{ outline: 'none' }} textOverflow={'ellipsis'} whiteSpace={'nowrap'} overflow={'hidden'} textAlign={'center'} as={Button} rightIcon={<ChevronDownIcon />}>
                        {currentEvent.name}
                    </MenuButton>
                    <MenuList textAlign={'center'}>
                        {events.map((event, index) => (
                            <MenuItem maxW={'75vw'} textAlign={'center'} key={index} onClick={() => setCurrentEvent({ name: event.name, key: event.key })}>
                                {event.name}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </Center>
            {currentEvent.key === '' || loadingEvent || loadingPitForms ? (
                <Center>
                    <Spinner></Spinner>
                </Center>
            ) : (
                <Box marginBottom={'25px'}>
                    {event.teams
                        .sort((a, b) => a.number - b.number)
                        .map((team, index) => (
                            <Grid borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} key={index} templateColumns='1fr 2fr 1fr' gap={'5px'}>
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
                                <GridItem padding={'10px 0px 10px 0px'} marginRight={'10px'} marginLeft={'10px'} textAlign={'center'}>
                                    <Button size='sm' onClick={() => navigate(`/pitform/${currentEvent.key}/${team.number}`)}>
                                        {getPitFormStatus(team.name)}
                                    </Button>
                                </GridItem>
                            </Grid>
                        ))}
                </Box>
            )}
        </Box>
    );
}

export default PitPage;
