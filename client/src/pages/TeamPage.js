import { useQuery } from '@apollo/client';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Button, Center, Flex, Grid, GridItem, Image, Menu, MenuButton, MenuItem, MenuList, Spinner, Text } from '@chakra-ui/react';
import { React, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GET_CURRENT_EVENT, GET_TEAMS_MATCHFORMS, GET_TEAMS_PITFORMS } from '../graphql/queries';
import { year } from '../util/constants';
import {
    convertMatchKeyToString,
    convertStationKeyToString,
    countOccurencesForTFField,
    getDefenseRatings,
    getFields,
    getFractionForClimb,
    getPercentageForTFField,
    getSuccessfulClimbTimes,
    getSucessfulClimbRungMode,
    medianArr,
    sortBlueAllianceEvents,
    sortMatches,
} from '../util/helperFunctions';
import '../stylesheets/teamstyle.css';
import missingImage from '../images/PlaceholderImage.png';

function TeamPage() {
    let { teamNumber: teamNumberParam } = useParams();

    const [error, setError] = useState(null);
    const [events, setEvents] = useState(null);
    const [teamName, setTeamName] = useState(null);
    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '' });
    const [focusedEvent, setFocusedEvent] = useState('');
    const [pitForm, setPitForm] = useState(null);
    const [matchForms, setMatchForms] = useState(null);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        fetch(`/blueAlliance/team/frc${teamNumberParam}/events/${year}/simple`)
            .then((response) => response.json())
            .then((data) => {
                if (!data.Error) {
                    setEvents(sortBlueAllianceEvents(data));
                } else {
                    setError(data.Error);
                }
            })
            .catch((error) => {
                setError(error);
            });
        fetch(`/blueAlliance/team/frc${teamNumberParam}/simple`)
            .then((response) => response.json())
            .then((data) => {
                if (!data.Error) {
                    setTeamName(data.nickname);
                } else {
                    setError(data.Error);
                }
            })
            .catch((error) => {
                setError(error);
            });
    }, [teamNumberParam]);

    const {
        loading: loadingPitForms,
        error: pitFormsError,
        data: { getTeamsPitForms: pitFormsData } = {},
    } = useQuery(GET_TEAMS_PITFORMS, {
        fetchPolicy: 'network-only',
        variables: {
            teamNumber: parseInt(teamNumberParam),
        },
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, check console for logs');
        },
    });

    const {
        loading: loadingMatchForms,
        error: matchFormsError,
        data: { getTeamsMatchForms: matchFormsData } = {},
    } = useQuery(GET_TEAMS_MATCHFORMS, {
        fetchPolicy: 'network-only',
        variables: {
            teamNumber: parseInt(teamNumberParam),
        },
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, check console for logs');
        },
    });

    const { loading: loadingCurrentEvent, error: currentEventError } = useQuery(GET_CURRENT_EVENT, {
        skip: events === null || events.length === 0 || loadingMatchForms || loadingPitForms,
        fetchPolicy: 'network-only',
        onError(err) {
            if (err.message === 'Error: There is no current event') {
                setPitForm(pitFormsData.find((pitForm) => pitForm.eventKey === events[events.length - 1].key));
                setMatchForms(matchFormsData.filter((matchForm) => matchForm.eventKey === events[events.length - 1].key));
                setCurrentEvent({ name: events[events.length - 1].name, key: events[events.length - 1].key });
                setFocusedEvent(events[events.length - 1].name);
                setError(false);
            } else {
                console.log(JSON.stringify(err, null, 2));
                setError('Apollo error, check console for logs');
            }
        },
        onCompleted({ getCurrentEvent: currentEvent }) {
            let event = events[events.length - 1];
            if (events.some((event) => event.key === currentEvent.key)) {
                event = currentEvent;
            }
            setPitForm(pitFormsData.find((pitForm) => pitForm.eventKey === event.key));
            setMatchForms(matchFormsData.filter((matchForm) => matchForm.eventKey === event.key));
            setCurrentEvent({ name: event.name, key: event.key });
            setFocusedEvent(event.name);
        },
    });

    if (error) {
        return (
            <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                {error}
            </Box>
        );
    }

    if (events && events.length === 0) {
        return (
            <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                This team is not competing at any events
            </Box>
        );
    }

    if (loadingMatchForms || loadingPitForms || loadingCurrentEvent || events === null || teamName === null || currentEvent.key === '' || ((pitFormsError || matchFormsError || currentEventError) && error !== false)) {
        return (
            <Center>
                <Spinner></Spinner>
            </Center>
        );
    }

    function renderTab(tab) {
        switch (tab) {
            case 0:
                return (
                    <Flex flexWrap={'wrap'}>
                        <Box flex={1} className='robotFlex1'>
                            <Box w={'100%'} margin={'0 auto'} marginBottom={'25px'} textAlign={'center'} padding={'10px'} paddingBottom={'0px'}>
                                <Text marginBottom={'0px'} fontWeight={'600'} fontSize={'150%'}>
                                    Team Number: {teamNumberParam}
                                </Text>
                                <Text marginBottom={'0px'} fontWeight={'600'} fontSize={'150%'}>
                                    Team Name: {teamName}
                                </Text>
                                <Text marginBottom={'0px'} fontWeight={'600'} fontSize={'150%'}>
                                    Pit Form: {pitForm ? 'Completed' : 'Not Complete'}
                                </Text>
                                <Text marginBottom={'0px'} fontWeight={'600'} fontSize={'150%'}>
                                    Match Forms: {matchForms.length}
                                </Text>
                            </Box>
                            <Image
                                margin={'0 auto'}
                                w={{ base: '75%', sm: '75%', md: '75%', lg: '75%' }}
                                minW={{ base: '75%', sm: '75%', md: '75%', lg: '75%' }}
                                maxW={{ base: '75%', sm: '75%', md: '75%', lg: '75%' }}
                                src={pitForm && pitForm.image !== '' ? pitForm.image : missingImage}
                            />
                        </Box>
                        <Box flex={1} className='robotFlex2'>
                            <Box w={{ base: '90%', sm: '75%' }} margin={'0 auto'} boxShadow={'rgba(0, 0, 0, 0.35) 0px 3px 8px'} marginBottom={'25px'} textAlign={'start'} border={'2px black solid'} borderRadius={'10px'} padding={'10px'}>
                                <Text textAlign={'center'} marginBottom={'5px'} textDecoration={'underline'} fontWeight={'bold'} fontSize={'125%'}>
                                    Auto:
                                </Text>
                                {matchForms.length > 0 ? (
                                    <Box>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Lower Hub (Median): {medianArr(getFields(matchForms, 'lowerCargoAuto'))} Cargo
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Upper Hub (Median): {medianArr(getFields(matchForms, 'upperCargoAuto'))} Cargo
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Taxi Percentage: {getPercentageForTFField(matchForms, 'crossTarmac') * 100}%
                                        </Text>
                                    </Box>
                                ) : (
                                    <Text marginBottom={'0px'} fontWeight={'600'} fontSize={'110%'}>
                                        No Match Data
                                    </Text>
                                )}
                            </Box>
                            <Box w={{ base: '90%', sm: '75%' }} margin={'0 auto'} boxShadow={'rgba(0, 0, 0, 0.35) 0px 3px 8px'} marginBottom={'25px'} textAlign={'start'} border={'2px black solid'} borderRadius={'10px'} padding={'10px'}>
                                <Text textAlign={'center'} marginBottom={'5px'} textDecoration={'underline'} fontWeight={'bold'} fontSize={'125%'}>
                                    Teleop:
                                </Text>
                                {matchForms.length > 0 ? (
                                    <Box>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Lower Hub (Median): {medianArr(getFields(matchForms, 'lowerCargoTele'))} Cargo
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Upper Hub (Median): {medianArr(getFields(matchForms, 'upperCargoTele'))} Cargo
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Successful Climbs/Attempted Climbs: {getFractionForClimb(matchForms)}
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Climb Time for Successful Climbs (Median): {matchForms.filter((a) => a.climbTime > 0 && a.climbRung !== 'Failed').length > 0 ? `${medianArr(getSuccessfulClimbTimes(matchForms)) / 1000} sec` : 'N/A'}
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Most Common Rung(s) for Successful Climbs: {getSucessfulClimbRungMode(matchForms)}
                                        </Text>
                                    </Box>
                                ) : (
                                    <Text marginBottom={'0px'} fontWeight={'600'} fontSize={'110%'}>
                                        No Match Data
                                    </Text>
                                )}
                            </Box>
                            <Box w={{ base: '90%', sm: '75%' }} margin={'0 auto'} boxShadow={'rgba(0, 0, 0, 0.35) 0px 3px 8px'} marginBottom={'25px'} textAlign={'start'} border={'2px black solid'} borderRadius={'10px'} padding={'10px'}>
                                <Text textAlign={'center'} marginBottom={'5px'} textDecoration={'underline'} fontWeight={'bold'} fontSize={'125%'}>
                                    Post:
                                </Text>
                                {matchForms.length > 0 ? (
                                    <Box>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Playing Defense Rating (Median): {medianArr(getDefenseRatings(matchForms))} (1-5)
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            # of Lose Communication: {countOccurencesForTFField(matchForms, 'loseCommunication')}
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            # of Robot Break: {countOccurencesForTFField(matchForms, 'robotBreak')}
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            # of Yellow Card: {countOccurencesForTFField(matchForms, 'yellowCard')}
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            # of Red Card: {countOccurencesForTFField(matchForms, 'redCard')}
                                        </Text>
                                    </Box>
                                ) : (
                                    <Text marginBottom={'0px'} fontWeight={'600'} fontSize={'110%'}>
                                        No Match Data
                                    </Text>
                                )}
                            </Box>
                        </Box>
                    </Flex>
                );
            case 1:
                return pitForm ? (
                    <Box paddingBottom={'25px'}>
                        <Box w={{ base: '90%', sm: '75%' }} margin={'0 auto'} boxShadow={'rgba(0, 0, 0, 0.35) 0px 3px 8px'} marginBottom={'25px'} textAlign={'start'} border={'2px black solid'} borderRadius={'10px'} padding={'10px'}>
                            <Text textAlign={'center'} marginBottom={'5px'} textDecoration={'underline'} fontWeight={'bold'} fontSize={'125%'}>
                                Basics:
                            </Text>
                            <Box>
                                <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Weight: {pitForm.weight} lbs
                                </Text>
                                <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Height: {pitForm.height} inches
                                </Text>
                            </Box>
                        </Box>
                        <Box w={{ base: '90%', sm: '75%' }} margin={'0 auto'} boxShadow={'rgba(0, 0, 0, 0.35) 0px 3px 8px'} marginBottom={'25px'} textAlign={'start'} border={'2px black solid'} borderRadius={'10px'} padding={'10px'}>
                            <Text textAlign={'center'} marginBottom={'5px'} textDecoration={'underline'} fontWeight={'bold'} fontSize={'125%'}>
                                Drive Train:
                            </Text>
                            <Box>
                                <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Type: {pitForm.driveTrain}
                                </Text>
                                <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Motors:
                                </Text>
                                {pitForm.motors.map((motor) => (
                                    <Text marginLeft={'15px'} key={motor._id} fontWeight={'600'} fontSize={'100%'}>{`${motor.label} (${motor.value})`}</Text>
                                ))}
                                <Text marginTop={'5px'} marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Wheel:
                                </Text>
                                {pitForm.wheels.map((wheel) => (
                                    <Text marginLeft={'15px'} key={wheel._id} fontWeight={'600'} fontSize={'100%'}>{`${wheel.label} (${wheel.value}), ${wheel.size} in`}</Text>
                                ))}
                                <Text marginTop={'5px'} marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Comment: <span style={{ fontWeight: '600', fontSize: '95%' }}>{pitForm.driveTrainComment}</span>
                                </Text>
                            </Box>
                        </Box>
                        <Box w={{ base: '90%', sm: '75%' }} margin={'0 auto'} boxShadow={'rgba(0, 0, 0, 0.35) 0px 3px 8px'} marginBottom={'25px'} textAlign={'start'} border={'2px black solid'} borderRadius={'10px'} padding={'10px'}>
                            <Text textAlign={'center'} marginBottom={'5px'} textDecoration={'underline'} fontWeight={'bold'} fontSize={'125%'}>
                                Autonomous:
                            </Text>
                            <Box>
                                <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Programming Language: {pitForm.programmingLanguage}
                                </Text>
                                <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Prefered Starting Position: {pitForm.startingPosition}
                                </Text>
                                <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Taxi: {pitForm.taxi}
                                </Text>
                                <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Best Auto: <span style={{ fontWeight: '600', fontSize: '95%' }}>{pitForm.autoComment}</span>
                                </Text>
                            </Box>
                        </Box>
                        <Box w={{ base: '90%', sm: '75%' }} margin={'0 auto'} boxShadow={'rgba(0, 0, 0, 0.35) 0px 3px 8px'} marginBottom={'25px'} textAlign={'start'} border={'2px black solid'} borderRadius={'10px'} padding={'10px'}>
                            <Text textAlign={'center'} marginBottom={'5px'} textDecoration={'underline'} fontWeight={'bold'} fontSize={'125%'}>
                                Abilities:
                            </Text>
                            <Box>
                                <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Intake:
                                </Text>
                                {pitForm.abilities
                                    .slice(0, 3)
                                    .filter((ability) => ability.value)
                                    .map((ability) => (
                                        <Text marginLeft={'15px'} key={ability._id} fontWeight={'600'} fontSize={'100%'}>{`${ability.label}`}</Text>
                                    ))}
                                <Text marginTop={'5px'} marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Shooting:
                                </Text>
                                {pitForm.abilities
                                    .slice(3, 5)
                                    .filter((ability) => ability.value)
                                    .map((ability) => (
                                        <Text marginLeft={'15px'} key={ability._id} fontWeight={'600'} fontSize={'100%'}>{`${ability.label}`}</Text>
                                    ))}
                                <Text marginTop={'5px'} marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Climb:
                                </Text>
                                {pitForm.abilities
                                    .slice(5)
                                    .filter((ability) => ability.value)
                                    .map((ability) => (
                                        <Text marginLeft={'15px'} key={ability._id} fontWeight={'600'} fontSize={'100%'}>{`${ability.label}`}</Text>
                                    ))}
                            </Box>
                        </Box>
                        <Box w={{ base: '90%', sm: '75%' }} margin={'0 auto'} boxShadow={'rgba(0, 0, 0, 0.35) 0px 3px 8px'} textAlign={'start'} border={'2px black solid'} borderRadius={'10px'} padding={'10px'}>
                            <Text textAlign={'center'} marginBottom={'5px'} textDecoration={'underline'} fontWeight={'bold'} fontSize={'125%'}>
                                Closing:
                            </Text>
                            <Box>
                                <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Working On: {pitForm.workingComment}
                                </Text>
                                <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    End Comment: {pitForm.closingComment}
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                        No Pit Data
                    </Box>
                );
            case 2:
                return matchForms.length > 0 ? (
                    <Box overflowX={'auto'}>
                        <Grid minW={'764px'} margin={'0 auto'} borderTop={'1px solid black'} backgroundColor={'gray.300'} templateColumns='2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr' gap={'5px'}>
                            <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    Match # : Station
                                </Text>
                            </GridItem>
                            <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    Scouter
                                </Text>
                            </GridItem>
                            <GridItem padding={'10px 0px 10px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    Lower Hub (Auto)
                                </Text>
                            </GridItem>
                            <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    Upper Hub (Auto)
                                </Text>
                            </GridItem>
                            <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    Taxi
                                </Text>
                            </GridItem>
                            <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    Lower Hub (Teleop)
                                </Text>
                            </GridItem>
                            <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    Upper Hub (Teleop)
                                </Text>
                            </GridItem>
                            <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    Climb Time
                                </Text>
                            </GridItem>
                            <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    Climb Rung
                                </Text>
                            </GridItem>
                            <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    Played Defense (1-5)
                                </Text>
                            </GridItem>
                        </Grid>
                        {sortMatches(matchForms).map((match, index) => (
                            <Grid minW={'764px'} margin={'0 auto'} borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} key={match._id} templateColumns='2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr' gap={'5px'}>
                                <GridItem padding={'10px 0px 10px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {convertMatchKeyToString(match.matchNumber)} : {convertStationKeyToString(match.station)}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {`${match.scouter.split(' ')[0]}  ${match.scouter.split(' ')[1].charAt(0)}.`}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {match.lowerCargoAuto}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {match.upperCargoAuto}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {match.crossTarmac ? 'Yes' : 'No'}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {match.lowerCargoTele}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {match.upperCargoTele}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {match.climbTime > 0 ? match.climbTime / 1000 : 'N/A'}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {match.climbTime > 0 ? match.climbRung : 'N/A'}
                                    </Text>
                                </GridItem>
                                <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                    <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                        {match.defenseRating > 0 ? match.defenseRating : 'N/A'}
                                    </Text>
                                </GridItem>
                            </Grid>
                        ))}
                    </Box>
                ) : (
                    <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                        No Match Data
                    </Box>
                );
            default:
                return null;
        }
    }

    return (
        <Box>
            <div className='tabs'>
                <div className='tab-header'>
                    <div onClick={() => setTab(0)}>Overview</div>
                    <div onClick={() => setTab(1)}>Pit Data</div>
                    <div onClick={() => setTab(2)}>Match Data</div>
                    <div onClick={() => setTab(3)}>Other</div>
                </div>
                <div className='tab-indicator' style={{ left: `calc((calc(100% / 4) * ${tab}) + 3.125%)` }}></div>
            </div>
            <Box margin={'0 auto'} marginTop={'25px'} width={tab !== 2 ? { base: '100%', md: '66%', lg: '66%' } : { base: '100%', md: '100%', lg: '100%' }}>
                <Center marginBottom={'25px'}>
                    <Menu placement='bottom'>
                        <MenuButton maxW={'75vw'} onClick={() => setFocusedEvent('')} _focus={{ outline: 'none' }} as={Button} rightIcon={<ChevronDownIcon />}>
                            <Box overflow={'hidden'} textOverflow={'ellipsis'}>
                                {currentEvent.name}
                            </Box>
                        </MenuButton>
                        <MenuList>
                            {events.map((eventItem) => (
                                <MenuItem
                                    textAlign={'center'}
                                    justifyContent={'center'}
                                    _focus={{ backgroundColor: 'none' }}
                                    onMouseEnter={() => setFocusedEvent(eventItem.name)}
                                    backgroundColor={(currentEvent.name === eventItem.name && focusedEvent === '') || focusedEvent === eventItem.name ? 'gray.100' : 'none'}
                                    maxW={'75vw'}
                                    key={eventItem.key}
                                    onClick={() => {
                                        setCurrentEvent({ name: eventItem.name, key: eventItem.key });
                                        setPitForm(pitFormsData.find((pitForm) => pitForm.eventKey === eventItem.key));
                                        setMatchForms(matchFormsData.filter((matchForm) => matchForm.eventKey === eventItem.key));
                                    }}
                                >
                                    {eventItem.name}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                </Center>
                {renderTab(tab)}
            </Box>
        </Box>
    );
}

export default TeamPage;
