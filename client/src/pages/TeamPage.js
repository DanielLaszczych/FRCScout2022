import { useQuery } from '@apollo/client';
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Center,
    Flex,
    Grid,
    GridItem,
    IconButton,
    Image as ChakraImage,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverTrigger,
    Spinner,
    Text,
} from '@chakra-ui/react';
import { React, useCallback, useEffect, useState } from 'react';
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
    getHubPercentage,
    getPercentageForTFField,
    getSuccessfulClimbTimes,
    getSucessfulClimbRungMode,
    medianArr,
    roundToHundredth,
    sortBlueAllianceEvents,
    sortMatches,
} from '../util/helperFunctions';
import '../stylesheets/teamstyle.css';
import { GrMap } from 'react-icons/gr';
import Field from '../images/Field.png';
import { BiCommentEdit } from 'react-icons/bi';
import HeatMap from '../components/HeatMap';
import { v4 as uuidv4 } from 'uuid';

let doResize;

function TeamPage() {
    const { teamNumber: teamNumberParam } = useParams();

    const [error, setError] = useState(null);
    const [events, setEvents] = useState(null);
    const [teamName, setTeamName] = useState(null);
    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '' });
    const [focusedEvent, setFocusedEvent] = useState('');
    const [pitForm, setPitForm] = useState(null);
    const [matchForms, setMatchForms] = useState(null);
    const [tab, setTab] = useState(0);
    const [currentPopoverData, setCurrentPopoverData] = useState(null);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1200);

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
            setError('Apollo error, could not retrieve pit forms');
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
            setError('Apollo error, could not retrieve match forms');
        },
    });

    const { loading: loadingCurrentEvent, error: currentEventError } = useQuery(GET_CURRENT_EVENT, {
        skip: events === null || events.length === 0 || loadingMatchForms || loadingPitForms,
        fetchPolicy: 'network-only',
        onError(err) {
            if (err.message === 'Error: There is no current event') {
                let event = events[events.length - 1];
                setPitForm(pitFormsData.find((pitForm) => pitForm.eventKey === event.key));
                setMatchForms(matchFormsData.filter((matchForm) => matchForm.eventKey === event.key));
                setCurrentEvent({ name: event.name, key: event.key });
                setFocusedEvent(event.name);
                setError(false);
            } else {
                console.log(JSON.stringify(err, null, 2));
                setError('Apollo error, could not retrieve current event data');
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

    const updateDesktop = () => {
        setIsDesktop(window.innerWidth > 1200);
    };

    useEffect(() => {
        window.addEventListener('resize', updateDesktop);

        return () => window.removeEventListener('resize', updateDesktop);
    }, []);

    function calculatePopoverImageScale() {
        let scale;
        let screenWidth = window.innerWidth;
        let isDesktop = window.innerWidth > 1200;
        if (screenWidth < 768) {
            scale = isDesktop ? 0.5 : 0.25;
        } else if (screenWidth < 992) {
            scale = isDesktop ? 0.35 : 0.175;
        } else {
            scale = isDesktop ? 0.2 : 0.15;
        }
        return (screenWidth / 414) * scale;
    }

    function calculatePopoverCircleRadius() {
        let scale;
        let screenWidth = window.innerWidth;
        let isDesktop = window.innerWidth > 1200;
        if (screenWidth < 768) {
            scale = isDesktop ? 0.5 : 0.25;
        } else if (screenWidth < 992) {
            scale = isDesktop ? 0.35 : 0.175;
        } else {
            scale = isDesktop ? 0.2 : 0.15;
        }
        return (screenWidth / 25) * scale;
    }

    const drawPopoverImage = useCallback(async (point, id) => {
        while (document.getElementById(`${id}`) === null) {
            await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        const canvasElement = document.getElementById(`${id}`);
        if (canvasElement !== null) {
            const ctx = canvasElement.getContext('2d');
            let img = new Image();
            img.src = Field;
            img.onload = () => {
                let scale = calculatePopoverImageScale();
                canvasElement.width = 414 * scale;
                canvasElement.height = 414 * scale;
                ctx.drawImage(img, 0, 0, 414 * scale, 414 * scale);
                if (point.x && point.y) {
                    let ctx = canvasElement.getContext('2d');
                    ctx.lineWidth = '4';
                    ctx.strokeStyle = 'green';
                    ctx.beginPath();
                    ctx.arc(point.x * calculatePopoverImageScale(), point.y * calculatePopoverImageScale(), calculatePopoverCircleRadius(), 0, 2 * Math.PI);
                    ctx.stroke();
                }
            };
        }
    }, []);

    const resizePopover = useCallback(() => {
        if (tab === 2) {
            clearTimeout(doResize);
            if (isDesktop && currentPopoverData !== null) {
                doResize = setTimeout(() => drawPopoverImage(currentPopoverData.point, currentPopoverData.id), 250);
            } else {
                doResize = setTimeout(() => sortMatches(matchForms).map((match) => drawPopoverImage(match.startingPosition, match._id)), 250);
            }
        } else {
            clearTimeout(doResize);
        }
    }, [drawPopoverImage, currentPopoverData, tab, isDesktop, matchForms]);

    useEffect(() => {
        window.addEventListener('resize', resizePopover);

        return () => window.removeEventListener('resize', resizePopover);
    }, [resizePopover]);

    useEffect(() => {
        if (tab === 2 && !isDesktop) {
            sortMatches(matchForms).map((match) => drawPopoverImage(match.startingPosition, match._id));
        }
    }, [tab, isDesktop, matchForms, drawPopoverImage]);

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
                            {pitForm && pitForm.image !== '' ? (
                                <ChakraImage margin={'0 auto'} w={{ base: '75%', sm: '75%', md: '75%', lg: '75%' }} minW={{ base: '75%', sm: '75%', md: '75%', lg: '75%' }} maxW={{ base: '75%', sm: '75%', md: '75%', lg: '75%' }} src={pitForm.image} />
                            ) : (
                                <Box w={{ base: '90%', sm: '75%' }} margin={'0 auto'} boxShadow={'rgba(0, 0, 0, 0.35) 0px 3px 8px'} textAlign={'center'} border={'2px black solid'} borderRadius={'10px'} padding={'10px'}>
                                    No Image Available
                                </Box>
                            )}
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
                                            Missed (Median): {medianArr(getFields(matchForms, 'missedAuto'))} Cargo
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Hub Percentage:{' '}
                                            {matchForms.find((matchForm) => matchForm.missedAuto > 0 || matchForm.lowerCargoAuto > 0 || matchForm.upperCargoAuto > 0) ? `${roundToHundredth(getHubPercentage(matchForms, 'Auto') * 100)}%` : 'N/A'}
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Taxi Percentage: {roundToHundredth(getPercentageForTFField(matchForms, 'crossTarmac') * 100)}%
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
                                            Missed (Median): {medianArr(getFields(matchForms, 'missedTele'))} Cargo
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Hub Percentage:{' '}
                                            {matchForms.find((matchForm) => matchForm.missedTele > 0 || matchForm.lowerCargoTele > 0 || matchForm.upperCargoTele > 0) ? `${roundToHundredth(getHubPercentage(matchForms, 'Tele') * 100)}%` : 'N/A'}
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Climb Success Rate: {getFractionForClimb(matchForms)}
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Climb Time (Median): {matchForms.filter((a) => a.climbTime > 0 && a.climbRung !== 'Failed').length > 0 ? `${medianArr(getSuccessfulClimbTimes(matchForms)) / 1000} sec` : 'N/A'}
                                        </Text>
                                        <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                            Most Common Rung(s): {getSucessfulClimbRungMode(matchForms)}
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
                                            Played Defense Rating (Median): {medianArr(getDefenseRatings(matchForms))} (1-5)
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
                    <Box marginBottom={'25px'}>
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
                                {pitForm.abilities.slice(0, 3).map((ability, index) => (
                                    <Text marginLeft={'15px'} key={index} fontWeight={'600'} fontSize={'100%'}>{`${ability}`}</Text>
                                ))}
                                <Text marginTop={'5px'} marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Shooting:
                                </Text>
                                {pitForm.abilities.slice(3, 5).map((ability, index) => (
                                    <Text marginLeft={'15px'} key={index} fontWeight={'600'} fontSize={'100%'}>{`${ability}`}</Text>
                                ))}
                                <Text marginTop={'5px'} marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Climb:
                                </Text>
                                {pitForm.abilities.slice(5).map((ability, index) => (
                                    <Text marginLeft={'15px'} key={index} fontWeight={'600'} fontSize={'100%'}>{`${ability}`}</Text>
                                ))}
                                <Text marginBottom={'5px'} fontWeight={'600'} fontSize={'110%'}>
                                    Cargo Capacity: {pitForm.holdingCapacity}
                                </Text>
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
                    <Box marginBottom={'25px'}>
                        {!isDesktop ? (
                            sortMatches(matchForms).map((match) => (
                                <div key={match._id} className='grid'>
                                    <div className='grid-column'>
                                        <div className='grid-item header'>
                                            {convertMatchKeyToString(match.matchNumber)} : {convertStationKeyToString(match.station)}
                                        </div>
                                        <div className='grid-item header'>{`${match.scouter.split(' ')[0]}  ${match.scouter.split(' ')[1].charAt(0)}.`}</div>
                                    </div>
                                    <div className='grid-column'>
                                        <div className='grid-item header'>Pre-Auto</div>
                                        <div className='grid-item header'>Auto</div>
                                        <div className='grid-item header'>Post-Auto</div>
                                    </div>
                                    <div className='grid-column'>
                                        <div className='grid-item' style={{ textAlign: 'center' }}>
                                            <Center paddingTop={'5px'} paddingBottom={'5px'} pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                                <Spinner pos={'absolute'} zIndex={-1}></Spinner>
                                                <canvas id={match._id} width={414 * calculatePopoverImageScale()} height={414 * calculatePopoverImageScale()} style={{ zIndex: 0 }}></canvas>
                                            </Center>
                                        </div>
                                        <div className='grid-item'>
                                            <div>Lower Hub: {match.lowerCargoAuto}</div>
                                            <div>Upper Hub: {match.upperCargoAuto}</div>
                                            <div>Missed: {match.missedAuto}</div>
                                        </div>
                                        <Box className='grid-item'>
                                            <div>Taxi: {match.crossTarmac ? 'Yes' : 'No'}</div>
                                            <Text flexBasis={'120px'} flexGrow={1} overflowY={'auto'}>
                                                Auto Comment: {match.autoComment || 'None'}
                                            </Text>
                                        </Box>
                                    </div>
                                    <div className='grid-column'>
                                        <div className='grid-item header'>Teleop</div>
                                        <div className='grid-item header'>End-Game</div>
                                        <div className='grid-item header'>Post-Game</div>
                                    </div>
                                    <div className='grid-column'>
                                        <div className='grid-item'>
                                            <div>Lower Hub: {match.lowerCargoTele}</div>
                                            <div>Upper Hub: {match.upperCargoTele}</div>
                                            <div>Missed: {match.missedTele}</div>
                                        </div>
                                        <div className='grid-item'>
                                            <div>Climb Time: {match.climbTime > 0 ? match.climbTime / 1000 : 'N/A'}</div>
                                            <div>Rung: {match.climbTime > 0 ? match.climbRung : 'N/A'}</div>
                                        </div>
                                        <div className='grid-item'>
                                            <div>Played Defense (1-5): {match.defenseRating > 0 ? match.defenseRating : 'N/A'}</div>
                                            <Text flexBasis={'100px'} flexGrow={2} overflowY={'auto'}>
                                                End Comment: {match.endComment || 'None'}
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Box>
                                <Grid margin={'0 auto'} borderTop={'1px solid black'} backgroundColor={'gray.300'} templateColumns='2fr 1fr 1fr 1fr 1fr 0.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr' gap={'5px'}>
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
                                            Missed (Auto)
                                        </Text>
                                    </GridItem>
                                    <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                        <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                            Starting Position
                                        </Text>
                                    </GridItem>
                                    <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                        <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                            Taxi
                                        </Text>
                                    </GridItem>
                                    <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                        <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                            Lower Hub (Tele)
                                        </Text>
                                    </GridItem>
                                    <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                        <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                            Upper Hub (Tele)
                                        </Text>
                                    </GridItem>
                                    <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                        <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                            Missed (Tele)
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
                                    <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                        <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                            Comments
                                        </Text>
                                    </GridItem>
                                </Grid>
                                {sortMatches(matchForms).map((match, index) => (
                                    <Grid margin={'0 auto'} borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} key={match._id} templateColumns='2fr 1fr 1fr 1fr 1fr 0.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr' gap={'5px'}>
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
                                                {match.missedAuto}
                                            </Text>
                                        </GridItem>
                                        <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                            <Popover
                                                onOpen={() => {
                                                    drawPopoverImage(match.startingPosition, match._id);
                                                    setCurrentPopoverData({ point: match.startingPosition, id: match._id });
                                                }}
                                                onClose={() => setCurrentPopoverData(null)}
                                                flip={false}
                                                placement='bottom'
                                            >
                                                <PopoverTrigger>
                                                    <IconButton pos={'relative'} top={'50%'} transform={'translateY(-50%)'} icon={<GrMap />} _focus={{ outline: 'none' }} size='sm' />
                                                </PopoverTrigger>
                                                <PopoverContent padding={'25px'} width={'max-content'} height={'max-content'} _focus={{ outline: 'none' }}>
                                                    <PopoverArrow />
                                                    <PopoverCloseButton />
                                                    <PopoverBody>
                                                        <Center>
                                                            <Spinner pos={'absolute'} zIndex={-1}></Spinner>
                                                            <canvas id={match._id} width={414 * calculatePopoverImageScale()} height={414 * calculatePopoverImageScale()} style={{ zIndex: 0 }}></canvas>
                                                        </Center>
                                                    </PopoverBody>
                                                </PopoverContent>
                                            </Popover>
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
                                                {match.missedTele}
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
                                        <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                            <Popover flip={false} placement='bottom-start'>
                                                <PopoverTrigger>
                                                    <IconButton pos={'relative'} top={'50%'} transform={'translateY(-50%)'} icon={<BiCommentEdit />} _focus={{ outline: 'none' }} size='sm' />
                                                </PopoverTrigger>
                                                <PopoverContent key={uuidv4()} maxWidth={'75vw'} padding={'15px'} _focus={{ outline: 'none' }}>
                                                    <PopoverArrow />
                                                    <PopoverCloseButton />
                                                    <PopoverBody>
                                                        <Box>
                                                            <Text>Auto Comment: {match.autoComment || 'None'}</Text>
                                                            <Text>End Comment: {match.endComment || 'None'}</Text>
                                                        </Box>
                                                    </PopoverBody>
                                                </PopoverContent>
                                            </Popover>
                                        </GridItem>
                                    </Grid>
                                ))}
                            </Box>
                        )}
                    </Box>
                ) : (
                    <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                        No Match Data
                    </Box>
                );
            case 3:
                return matchForms.length > 0 ? (
                    <Box marginBottom={'25px'}>
                        <Center>
                            <HeatMap data={matchForms} largeScale={0.2} mediumScale={0.5} smallScale={0.8} maxOccurances={3}></HeatMap>
                        </Center>
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
