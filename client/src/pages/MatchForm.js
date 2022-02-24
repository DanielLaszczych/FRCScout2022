import { useMutation, useQuery } from '@apollo/client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Center,
    Checkbox,
    Flex,
    HStack,
    Slider,
    SliderFilledTrack,
    SliderMark,
    SliderThumb,
    SliderTrack,
    Spinner,
    Text,
    Textarea,
    useToast,
} from '@chakra-ui/react';
import { GET_MATCHFORM_BY_STATION } from '../graphql/queries';
import Field from '../images/Field.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import CustomMinusButton from '../components/CustomMinusButton';
import CustomPlusButton from '../components/CustomPlusButton';
import StopWatch from '../components/StopWatch';
import { UPDATE_MATCHFORM } from '../graphql/mutations';

let tabs = ['Pre-Auto', 'Auto', 'Post-Auto', 'Teleop', 'Post-Game'];
let rungs = [
    { label: 'Low Rung', id: uuidv4() },
    { label: 'Mid Rung', id: uuidv4() },
    { label: 'High Rung', id: uuidv4() },
    { label: 'Traversal Rung', id: uuidv4() },
    { label: 'Failed', id: uuidv4() },
];
let defenseRatings = [
    { value: 0, id: uuidv4() },
    { value: 1, id: uuidv4() },
    { value: 2, id: uuidv4() },
    { value: 3, id: uuidv4() },
    { value: 4, id: uuidv4() },
    { value: 5, id: uuidv4() },
];
let doResize;

function MatchForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();
    const { eventKey: eventKeyParam, matchNumber: matchNumberParam, station: stationParam, teamNumber: teamNumberParam } = useParams();

    const canvas = useRef(null);
    const swiper = useRef(null);
    const cancelRef = useRef(null);

    const [activeSlider, setActiveSlider] = useState(null);
    const [teamNumber, setTeamNumber] = useState(null);
    const [teamName, setTeamName] = useState(null);
    const [eventName, setEventName] = useState(null);
    const [validMatch, setValidMatch] = useState(false); //Used to check if the eventKeyParam and matchNumberParam leads to an actual match by using TBA API
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [matchFormDialog, setMatchFormDialog] = useState(false);
    const [loadResponse, setLoadResponse] = useState(null);
    const initialDrawn = useRef(false);
    const safeToSave = useRef(false);
    const [matchFormData, setMatchFormData] = useState({
        preLoadedCargo: null,
        startingPosition: { x: null, y: null },
        missedAuto: 0,
        lowerCargoAuto: 0,
        upperCargoAuto: 0,
        crossTarmac: null,
        autoComment: '',
        missedTele: 0,
        lowerCargoTele: 0,
        upperCargoTele: 0,
        climbTime: 0,
        climbRung: null,
        defenseRating: 0,
        loseCommunication: null,
        robotBreak: null,
        yellowCard: null,
        redCard: null,
        endComment: '',
        followUp: false,
        followUpComment: '',
        loading: true,
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (stationParam.length !== 2 || !/[rb][123]/.test(stationParam)) {
            setError('Invalid station in the url');
            return;
        }
        if (!/[0-9]+$/.test(teamNumberParam)) {
            setError('Invalid team number in the url');
            return;
        } else {
            setTeamNumber(teamNumberParam);
            setValidMatch(true);
        }
        // fetch(`/blueAlliance/match/${eventKeyParam}_${matchNumberParam}/simple`)
        // 	.then((response) => response.json())
        // 	.then((data) => {
        // 		if (!data.Error) {
        // 			let stationNumber = parseInt(stationParam.charAt(1)) - 1;
        // 			let teamKey;
        // 			if (stationParam.charAt(0) === 'r') {
        // 				teamKey = data.alliances.red.team_keys[stationNumber];
        // 			} else {
        // 				teamKey = data.alliances.blue.team_keys[stationNumber];
        // 			}
        // 			setTeamNumber(teamKey.substring(3));
        // 			setValidMatch(true);
        // 		} else {
        // 			setError(data.Error);
        // 		}
        // 	})
        // 	.catch((error) => {
        // 		setError(error);
        // 	});
    }, [eventKeyParam, matchNumberParam, stationParam, teamNumberParam]);

    useEffect(() => {
        if (localStorage.getItem('MatchFormData')) {
            let matchForm = JSON.parse(localStorage.getItem('MatchFormData'));
            if (matchForm.eventKeyParam === eventKeyParam && matchForm.matchNumberParam === matchNumberParam && matchForm.stationParam === stationParam) {
                setLoadResponse('Required');
                setMatchFormDialog(true);
            } else {
                setLoadResponse(false);
            }
        } else {
            setLoadResponse(false);
        }
    }, [eventKeyParam, matchNumberParam, stationParam]);

    useEffect(() => {
        if (validMatch && teamNumber) {
            fetch(`/blueAlliance/team/frc${teamNumber}/simple`)
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
            fetch(`/blueAlliance/event/${eventKeyParam}/simple`)
                .then((response) => response.json())
                .then((data) => {
                    if (!data.Error) {
                        setEventName(data.name);
                    } else {
                        setError(data.Error);
                    }
                })
                .catch((error) => {
                    setError(error);
                });
        }
    }, [validMatch, teamNumber, eventKeyParam]);

    const { loading: loadingMatchData, error: matchDataError } = useQuery(GET_MATCHFORM_BY_STATION, {
        skip: !validMatch || loadResponse === null || loadResponse,
        fetchPolicy: 'network-only',
        variables: {
            eventKey: eventKeyParam,
            matchNumber: matchNumberParam,
            station: stationParam,
        },
        onError(err) {
            if (err.message === 'Error: Match form does not exist') {
                setError(false);
                setMatchFormData({ ...matchFormData, loading: false });
                setActiveSlider(0);
            } else {
                console.log(JSON.stringify(err, null, 2));
                setError(`Apollo error, could not retrieve match form`);
            }
        },
        onCompleted({ getMatchFormByStation: matchForm }) {
            setMatchFormData({
                preLoadedCargo: matchForm.preLoadedCargo,
                startingPosition: { x: matchForm.startingPosition.x, y: matchForm.startingPosition.y },
                missedAuto: matchForm.missedAuto,
                lowerCargoAuto: matchForm.lowerCargoAuto,
                upperCargoAuto: matchForm.upperCargoAuto,
                crossTarmac: matchForm.crossTarmac,
                autoComment: matchForm.autoComment,
                missedTele: matchForm.missedTele,
                lowerCargoTele: matchForm.lowerCargoTele,
                upperCargoTele: matchForm.upperCargoTele,
                climbTime: matchForm.climbTime,
                climbRung: matchForm.climbRung,
                defenseRating: matchForm.defenseRating,
                loseCommunication: matchForm.loseCommunication,
                robotBreak: matchForm.robotBreak,
                yellowCard: matchForm.yellowCard,
                redCard: matchForm.redCard,
                endComment: matchForm.endComment,
                followUp: matchForm.followUp,
                followUpComment: matchForm.followUpComment,
                loading: false,
            });
            setActiveSlider(0);
        },
    });

    function calculateImageScale() {
        let scale;
        let screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            scale = 0.8;
        } else if (screenWidth < 992) {
            scale = 0.5;
        } else {
            scale = 0.2;
        }
        return (screenWidth / 414) * scale;
    }

    function calculateCircleRadius() {
        let scale;
        let screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            scale = 0.8;
        } else if (screenWidth < 992) {
            scale = 0.5;
        } else {
            scale = 0.2;
        }
        return (screenWidth / 25) * scale;
    }

    const drawImage = useCallback((point) => {
        const canvasElement = canvas.current;
        if (canvasElement !== null) {
            const ctx = canvasElement.getContext('2d');
            let img = new Image();
            img.src = Field;
            img.onload = () => {
                let scale = calculateImageScale();
                canvasElement.width = 414 * scale;
                canvasElement.height = 414 * scale;
                ctx.drawImage(img, 0, 0, 414 * scale, 414 * scale);
                if (swiper.current) {
                    swiper.current.swiper.update();
                }
                if (point.x && point.y) {
                    let ctx = canvasElement.getContext('2d');
                    ctx.lineWidth = '4';
                    ctx.strokeStyle = 'green';
                    ctx.beginPath();
                    ctx.arc(point.x * calculateImageScale(), point.y * calculateImageScale(), calculateCircleRadius(), 0, 2 * Math.PI);
                    ctx.stroke();
                }
                if (!initialDrawn.current) initialDrawn.current = true;
            };
        }
    }, []);

    const resizeCanvas = useCallback(() => {
        if (initialDrawn.current) {
            clearTimeout(doResize);
            doResize = setTimeout(() => drawImage(matchFormData.startingPosition), 250);
        }
    }, [drawImage, matchFormData.startingPosition]);

    useEffect(() => {
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    useEffect(() => {
        if (!matchFormData.loading && activeSlider === 0 && eventName && teamName) {
            drawImage(matchFormData.startingPosition);
        }
    }, [matchFormData.loading, activeSlider, drawImage, matchFormData.startingPosition, eventName, teamName]);

    useEffect(() => {
        if (swiper.current) {
            swiper.current.swiper.update();
        }
    }, [matchFormData.climbTime]);

    useEffect(() => {
        if (swiper.current) {
            swiper.current.swiper.update();
        }
    }, [matchFormData.followUp]);

    useEffect(() => {
        if (safeToSave.current) {
            localStorage.setItem('MatchFormData', JSON.stringify({ ...matchFormData, eventKeyParam, matchNumberParam, stationParam }));
        } else if (!matchFormData.loading) {
            safeToSave.current = true;
        }
    }, [matchFormData, eventKeyParam, matchNumberParam, stationParam]);

    function validPreAuto() {
        return matchFormData.preLoadedCargo !== null && matchFormData.startingPosition.x !== null && matchFormData.startingPosition.y !== null;
    }

    function validPostAuto() {
        return matchFormData.crossTarmac !== null;
    }

    function validTele() {
        return matchFormData.climbTime > 0 ? matchFormData.climbRung !== null : true;
    }

    function validPost() {
        return matchFormData.loseCommunication !== null && matchFormData.robotBreak !== null && matchFormData.yellowCard !== null && matchFormData.redCard !== null;
    }

    function validateTab(tab) {
        if (tab === 'Pre-Auto') {
            return validPreAuto();
        } else if (tab === 'Post-Auto') {
            return validPostAuto();
        } else if (tab === 'Teleop') {
            return validTele();
        } else if (tab === 'Post-Game') {
            return validPost();
        } else {
            return true;
        }
    }

    const [updateMatchForm] = useMutation(UPDATE_MATCHFORM, {
        onCompleted() {
            toast({
                title: 'Match Form Updated',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            if (location.state && location.state.previousRoute && location.state.previousRoute === 'matches') {
                navigate('/matches');
            } else {
                navigate('/');
            }
            localStorage.removeItem('MatchFormData');
        },
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            toast({
                title: 'Apollo Error',
                description: 'Match form could not be updated',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        },
    });

    function submit() {
        setSubmitAttempted(true);
        if (!matchFormData.followUp) {
            let toastText = [];
            if (!validPreAuto()) {
                toastText.push('Pre-Auto');
            }
            if (!validPostAuto()) {
                toastText.push('Post-Auto');
            }
            if (!validTele()) {
                toastText.push('Teleop');
            }
            if (!validPost()) {
                toastText.push('Post');
            }
            if (toastText.length !== 0) {
                toast({
                    title: 'Missing fields at:',
                    description: toastText.join(', '),
                    status: 'error',
                    duration: 2000,
                    isClosable: true,
                });
                return;
            }
        } else if (matchFormData.followUpComment.trim() === '') {
            toast({
                title: 'Missing fields',
                description: 'Leave a follow up comment',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        updateMatchForm({
            variables: {
                matchFormInput: {
                    eventKey: eventKeyParam,
                    eventName: eventName,
                    station: stationParam,
                    matchNumber: matchNumberParam,
                    teamNumber: parseInt(teamNumber),
                    teamName: teamName,
                    preLoadedCargo: matchFormData.preLoadedCargo,
                    startingPosition: matchFormData.startingPosition,
                    missedAuto: matchFormData.missedAuto,
                    lowerCargoAuto: matchFormData.lowerCargoAuto,
                    upperCargoAuto: matchFormData.upperCargoAuto,
                    crossTarmac: matchFormData.crossTarmac,
                    autoComment: matchFormData.autoComment.trim(),
                    missedTele: matchFormData.missedTele,
                    lowerCargoTele: matchFormData.lowerCargoTele,
                    upperCargoTele: matchFormData.upperCargoTele,
                    climbTime: matchFormData.climbTime,
                    climbRung: matchFormData.climbRung,
                    defenseRating: matchFormData.defenseRating,
                    loseCommunication: matchFormData.loseCommunication,
                    robotBreak: matchFormData.robotBreak,
                    yellowCard: matchFormData.yellowCard,
                    redCard: matchFormData.redCard,
                    endComment: matchFormData.endComment.trim(),
                    followUp: matchFormData.followUp,
                    followUpComment: matchFormData.followUp ? matchFormData.followUpComment.trim() : '',
                },
            },
        });
    }

    function renderTab(tab) {
        switch (tab) {
            case 'Pre-Auto':
                return (
                    <Box minH={'calc(100vh - 200px)'}>
                        <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Pre-Loaded Cargo:
                            </Text>
                            <HStack marginBottom={'20px'} marginLeft={'25px'} spacing={'30px'}>
                                <Button
                                    outline={matchFormData.preLoadedCargo === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                    _focus={{ outline: 'none' }}
                                    colorScheme={matchFormData.preLoadedCargo === true ? 'green' : 'gray'}
                                    onClick={() => setMatchFormData({ ...matchFormData, preLoadedCargo: true })}
                                >
                                    Yes
                                </Button>
                                <Button
                                    outline={matchFormData.preLoadedCargo === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                    _focus={{ outline: 'none' }}
                                    colorScheme={matchFormData.preLoadedCargo === false ? 'green' : 'gray'}
                                    onClick={() => setMatchFormData({ ...matchFormData, preLoadedCargo: false })}
                                >
                                    No
                                </Button>
                            </HStack>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Starting Position:
                            </Text>
                            <Center marginBottom={'10px'}>
                                <Spinner pos={'absolute'} zIndex={-1}></Spinner>
                                <canvas
                                    width={414 * calculateImageScale()}
                                    height={414 * calculateImageScale()}
                                    style={{ zIndex: 2, outline: matchFormData.startingPosition.x === null && submitAttempted && !matchFormData.followUp ? '4px solid red' : 'none' }}
                                    onClick={(event) => {
                                        var bounds = event.target.getBoundingClientRect();
                                        var x = event.clientX - bounds.left;
                                        var y = event.clientY - bounds.top;
                                        setMatchFormData({ ...matchFormData, startingPosition: { x: x / calculateImageScale(), y: y / calculateImageScale() } });
                                    }}
                                    ref={canvas}
                                ></canvas>
                            </Center>
                        </Box>
                    </Box>
                );
            case 'Auto':
                return (
                    <Box minH={'calc(100vh - 200px)'}>
                        <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Lower Hub:
                            </Text>
                            <Center marginBottom={'20px'}>
                                <HStack>
                                    <CustomMinusButton
                                        fontSize={{ base: '30px', md: '40px', lg: '40px' }}
                                        onClick={() => setMatchFormData({ ...matchFormData, lowerCargoAuto: matchFormData.lowerCargoAuto === 0 ? 0 : matchFormData.lowerCargoAuto - 1 })}
                                    />
                                    <Text minW={{ base: '54px', md: '54px', lg: '54px' }} fontSize={'50px'} textAlign={'center'}>
                                        {matchFormData.lowerCargoAuto}
                                    </Text>
                                    <CustomPlusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setMatchFormData({ ...matchFormData, lowerCargoAuto: matchFormData.lowerCargoAuto + 1 })} />
                                </HStack>
                            </Center>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Upper Hub:
                            </Text>
                            <Center marginBottom={'20px'}>
                                <HStack>
                                    <CustomMinusButton
                                        fontSize={{ base: '30px', md: '40px', lg: '40px' }}
                                        onClick={() => setMatchFormData({ ...matchFormData, upperCargoAuto: matchFormData.upperCargoAuto === 0 ? 0 : matchFormData.upperCargoAuto - 1 })}
                                    />
                                    <Text minW={{ base: '54px', md: '54px', lg: '54px' }} fontSize={'50px'} textAlign={'center'}>
                                        {matchFormData.upperCargoAuto}
                                    </Text>
                                    <CustomPlusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setMatchFormData({ ...matchFormData, upperCargoAuto: matchFormData.upperCargoAuto + 1 })} />
                                </HStack>
                            </Center>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Missed:
                            </Text>
                            <Center marginBottom={'10px'}>
                                <HStack>
                                    <CustomMinusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setMatchFormData({ ...matchFormData, missedAuto: matchFormData.missedAuto === 0 ? 0 : matchFormData.missedAuto - 1 })} />
                                    <Text minW={{ base: '54px', md: '54px', lg: '54px' }} fontSize={'50px'} textAlign={'center'}>
                                        {matchFormData.missedAuto}
                                    </Text>
                                    <CustomPlusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setMatchFormData({ ...matchFormData, missedAuto: matchFormData.missedAuto + 1 })} />
                                </HStack>
                            </Center>
                        </Box>
                    </Box>
                );
            case 'Post-Auto':
                return (
                    <Box minH={'calc(100vh - 200px)'}>
                        <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Taxi (Cross Tarmac):
                            </Text>
                            <HStack marginBottom={'20px'} marginLeft={'25px'} spacing={'30px'}>
                                <Button
                                    outline={matchFormData.crossTarmac === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                    _focus={{ outline: 'none' }}
                                    colorScheme={matchFormData.crossTarmac === true ? 'green' : 'gray'}
                                    onClick={() => setMatchFormData({ ...matchFormData, crossTarmac: true })}
                                >
                                    Yes
                                </Button>
                                <Button
                                    outline={matchFormData.crossTarmac === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                    _focus={{ outline: 'none' }}
                                    colorScheme={matchFormData.crossTarmac === false ? 'green' : 'gray'}
                                    onClick={() => setMatchFormData({ ...matchFormData, crossTarmac: false })}
                                >
                                    No
                                </Button>
                            </HStack>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Auto Comment:
                            </Text>
                            <Center marginBottom={'10px'}>
                                <Textarea
                                    _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                                    onChange={(event) => setMatchFormData({ ...matchFormData, autoComment: event.target.value })}
                                    value={matchFormData.autoComment}
                                    placeholder='Any comments about auto'
                                    w={'85%'}
                                ></Textarea>
                            </Center>
                        </Box>
                    </Box>
                );
            case 'Teleop':
                return (
                    <Box minH={'calc(100vh - 200px)'}>
                        <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Lower Hub:
                            </Text>
                            <Center marginBottom={'20px'}>
                                <HStack>
                                    <CustomMinusButton
                                        fontSize={{ base: '30px', md: '40px', lg: '40px' }}
                                        onClick={() => setMatchFormData({ ...matchFormData, lowerCargoTele: matchFormData.lowerCargoTele === 0 ? 0 : matchFormData.lowerCargoTele - 1 })}
                                    />
                                    <Text minW={{ base: '54px', md: '54px', lg: '54px' }} fontSize={'50px'} textAlign={'center'}>
                                        {matchFormData.lowerCargoTele}
                                    </Text>
                                    <CustomPlusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setMatchFormData({ ...matchFormData, lowerCargoTele: matchFormData.lowerCargoTele + 1 })} />
                                </HStack>
                            </Center>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Upper Hub:
                            </Text>
                            <Center marginBottom={'20px'}>
                                <HStack>
                                    <CustomMinusButton
                                        fontSize={{ base: '30px', md: '40px', lg: '40px' }}
                                        onClick={() => setMatchFormData({ ...matchFormData, upperCargoTele: matchFormData.upperCargoTele === 0 ? 0 : matchFormData.upperCargoTele - 1 })}
                                    />
                                    <Text minW={{ base: '54px', md: '54px', lg: '54px' }} fontSize={'50px'} textAlign={'center'}>
                                        {matchFormData.upperCargoTele}
                                    </Text>
                                    <CustomPlusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setMatchFormData({ ...matchFormData, upperCargoTele: matchFormData.upperCargoTele + 1 })} />
                                </HStack>
                            </Center>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Missed:
                            </Text>
                            <Center marginBottom={'20px'}>
                                <HStack>
                                    <CustomMinusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setMatchFormData({ ...matchFormData, missedTele: matchFormData.missedTele === 0 ? 0 : matchFormData.missedTele - 1 })} />
                                    <Text minW={{ base: '54px', md: '54px', lg: '54px' }} fontSize={'50px'} textAlign={'center'}>
                                        {matchFormData.missedTele}
                                    </Text>
                                    <CustomPlusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setMatchFormData({ ...matchFormData, missedTele: matchFormData.missedTele + 1 })} />
                                </HStack>
                            </Center>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Climb:
                            </Text>
                            <Center marginBottom={'10px'}>
                                <StopWatch setMatchFormData={setMatchFormData} initTime={matchFormData.climbTime}></StopWatch>
                            </Center>
                            {matchFormData.climbTime > 0 ? (
                                <Box>
                                    <Text marginBottom={'10px'} marginLeft={'10px'} fontWeight={'bold'} fontSize={'100%'}>
                                        Where:
                                    </Text>
                                    <Center>
                                        <Flex flexWrap={'wrap'} marginBottom={'2px'} justifyContent={'center'}>
                                            {rungs.map((rung) => (
                                                <Button
                                                    outline={matchFormData.climbRung === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                                    maxW={'125px'}
                                                    minW={'125px'}
                                                    margin={'8px'}
                                                    key={rung.id}
                                                    _focus={{ outline: 'none' }}
                                                    colorScheme={matchFormData.climbRung === rung.label ? 'green' : 'gray'}
                                                    onClick={() => setMatchFormData({ ...matchFormData, climbRung: rung.label })}
                                                >
                                                    {rung.label}
                                                </Button>
                                            ))}
                                        </Flex>
                                    </Center>
                                </Box>
                            ) : null}
                        </Box>
                    </Box>
                );
            case 'Post':
                return (
                    <Box minH={'calc(100vh - 200px)'}>
                        <Box border={'black solid'} borderRadius={'10px'} padding={'10px'}>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Played Defense:
                            </Text>
                            <Center marginBottom={'30px'}>
                                <Slider className='swiper-no-swiping' colorScheme={'green'} w={'80%'} value={matchFormData.defenseRating} min={0} max={5} step={1} onChange={(value) => setMatchFormData({ ...matchFormData, defenseRating: value })}>
                                    {defenseRatings.map((rating) => (
                                        <SliderMark mr={rating.value === 0 ? 'px' : '0px'} mt={'10px'} key={rating.id} value={rating.value}>
                                            {rating.value === 0 ? 'None' : rating.value}
                                        </SliderMark>
                                    ))}
                                    <SliderTrack>
                                        <SliderFilledTrack />
                                    </SliderTrack>
                                    <SliderThumb backgroundColor={'blackAlpha.900'} boxSize={5} _focus={{ outline: 'none' }} />
                                </Slider>
                            </Center>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Lose Communication:
                            </Text>
                            <HStack marginBottom={'20px'} marginLeft={'25px'} spacing={'30px'}>
                                <Button
                                    _focus={{ outline: 'none' }}
                                    outline={matchFormData.loseCommunication === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                    colorScheme={matchFormData.loseCommunication === true ? 'green' : 'gray'}
                                    onClick={() => setMatchFormData({ ...matchFormData, loseCommunication: true })}
                                >
                                    Yes
                                </Button>
                                <Button
                                    _focus={{ outline: 'none' }}
                                    outline={matchFormData.loseCommunication === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                    colorScheme={matchFormData.loseCommunication === false ? 'green' : 'gray'}
                                    onClick={() => setMatchFormData({ ...matchFormData, loseCommunication: false })}
                                >
                                    No
                                </Button>
                            </HStack>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Robot broke:
                            </Text>
                            <HStack marginBottom={'20px'} marginLeft={'25px'} spacing={'30px'}>
                                <Button
                                    _focus={{ outline: 'none' }}
                                    outline={matchFormData.robotBreak === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                    colorScheme={matchFormData.robotBreak === true ? 'green' : 'gray'}
                                    onClick={() => setMatchFormData({ ...matchFormData, robotBreak: true })}
                                >
                                    Yes
                                </Button>
                                <Button
                                    _focus={{ outline: 'none' }}
                                    outline={matchFormData.robotBreak === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                    colorScheme={matchFormData.robotBreak === false ? 'green' : 'gray'}
                                    onClick={() => setMatchFormData({ ...matchFormData, robotBreak: false })}
                                >
                                    No
                                </Button>
                            </HStack>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Yellow Card:
                            </Text>
                            <HStack marginBottom={'20px'} marginLeft={'25px'} spacing={'30px'}>
                                <Button
                                    _focus={{ outline: 'none' }}
                                    outline={matchFormData.yellowCard === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                    colorScheme={matchFormData.yellowCard === true ? 'green' : 'gray'}
                                    onClick={() => setMatchFormData({ ...matchFormData, yellowCard: true })}
                                >
                                    Yes
                                </Button>
                                <Button
                                    _focus={{ outline: 'none' }}
                                    outline={matchFormData.yellowCard === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                    colorScheme={matchFormData.yellowCard === false ? 'green' : 'gray'}
                                    onClick={() => setMatchFormData({ ...matchFormData, yellowCard: false })}
                                >
                                    No
                                </Button>
                            </HStack>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Red Card:
                            </Text>
                            <HStack marginBottom={'20px'} marginLeft={'25px'} spacing={'30px'}>
                                <Button
                                    _focus={{ outline: 'none' }}
                                    outline={matchFormData.redCard === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                    colorScheme={matchFormData.redCard === true ? 'green' : 'gray'}
                                    onClick={() => setMatchFormData({ ...matchFormData, redCard: true })}
                                >
                                    Yes
                                </Button>
                                <Button
                                    _focus={{ outline: 'none' }}
                                    outline={matchFormData.redCard === null && submitAttempted && !matchFormData.followUp ? '2px solid red' : 'none'}
                                    colorScheme={matchFormData.redCard === false ? 'green' : 'gray'}
                                    onClick={() => setMatchFormData({ ...matchFormData, redCard: false })}
                                >
                                    No
                                </Button>
                            </HStack>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Ending Comment:
                            </Text>
                            <Center marginBottom={'10px'}>
                                <Textarea
                                    _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                                    onChange={(event) => setMatchFormData({ ...matchFormData, endComment: event.target.value })}
                                    value={matchFormData.endComment}
                                    placeholder='Any ending comments'
                                    w={'85%'}
                                ></Textarea>
                            </Center>
                            <Center>
                                <Checkbox
                                    marginTop={'10px'}
                                    //removes the blue outline on focus
                                    css={`
                                        > span:first-of-type {
                                            box-shadow: unset;
                                        }
                                    `}
                                    colorScheme={'green'}
                                    isChecked={matchFormData.followUp}
                                    onChange={() => setMatchFormData({ ...matchFormData, followUp: !matchFormData.followUp })}
                                >
                                    Mark For Follow Up
                                </Checkbox>
                            </Center>
                            {matchFormData.followUp ? (
                                <Center marginTop={'10px'}>
                                    <Textarea
                                        isInvalid={matchFormData.followUp && submitAttempted && matchFormData.followUpComment.trim() === ''}
                                        _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                                        onChange={(event) => setMatchFormData({ ...matchFormData, followUpComment: event.target.value })}
                                        value={matchFormData.followUpComment}
                                        placeholder='What is the reason for the follow up?'
                                        w={'85%'}
                                    ></Textarea>
                                </Center>
                            ) : null}
                        </Box>
                        <Center>
                            <Button _focus={{ outline: 'none' }} marginBottom={'20px'} marginTop={'20px'} onClick={() => submit()}>
                                Submit
                            </Button>
                        </Center>
                    </Box>
                );
            default:
                return null;
        }
    }

    if (error) {
        return (
            <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                {error}
            </Box>
        );
    }

    if (loadResponse === 'Required') {
        return (
            <AlertDialog
                closeOnEsc={false}
                closeOnOverlayClick={false}
                isOpen={matchFormDialog}
                leastDestructiveRef={cancelRef}
                onClose={() => {
                    setMatchFormDialog(false);
                }}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent margin={0} w={{ base: '75%', md: '40%', lg: '30%' }} top='25%'>
                        <AlertDialogHeader color='black' fontSize='lg' fontWeight='bold'>
                            Unsaved Data
                        </AlertDialogHeader>
                        <AlertDialogBody>You have unsaved data for this match form. Would you like to load it, delete it, or pull data from the cloud?</AlertDialogBody>
                        <AlertDialogFooter>
                            <Button
                                onClick={() => {
                                    setMatchFormDialog(false);
                                    setLoadResponse(false);
                                    localStorage.removeItem('MatchFormData');
                                }}
                                _focus={{ outline: 'none' }}
                                colorScheme='red'
                            >
                                Delete
                            </Button>
                            <Button
                                colorScheme='yellow'
                                ml={3}
                                _focus={{ outline: 'none' }}
                                onClick={() => {
                                    setMatchFormDialog(false);
                                    setLoadResponse(false);
                                }}
                            >
                                Cloud
                            </Button>
                            <Button
                                colorScheme='blue'
                                ml={3}
                                _focus={{ outline: 'none' }}
                                onClick={() => {
                                    setMatchFormDialog(false);
                                    setLoadResponse(true);
                                    let matchForm = JSON.parse(localStorage.getItem('MatchFormData'));
                                    setMatchFormData({
                                        preLoadedCargo: matchForm.preLoadedCargo,
                                        startingPosition: { x: matchForm.startingPosition.x, y: matchForm.startingPosition.y },
                                        missedAuto: matchForm.missedAuto,
                                        lowerCargoAuto: matchForm.lowerCargoAuto,
                                        upperCargoAuto: matchForm.upperCargoAuto,
                                        crossTarmac: matchForm.crossTarmac,
                                        autoComment: matchForm.autoComment,
                                        missedTele: matchForm.missedTele,
                                        lowerCargoTele: matchForm.lowerCargoTele,
                                        upperCargoTele: matchForm.upperCargoTele,
                                        climbTime: matchForm.climbTime,
                                        climbRung: matchForm.climbRung,
                                        defenseRating: matchForm.defenseRating,
                                        loseCommunication: matchForm.loseCommunication,
                                        robotBreak: matchForm.robotBreak,
                                        yellowCard: matchForm.yellowCard,
                                        redCard: matchForm.redCard,
                                        endComment: matchForm.endComment,
                                        followUp: matchForm.followUp,
                                        followUpComment: matchForm.followUpComment,
                                        loading: false,
                                    });
                                    setActiveSlider(0);
                                }}
                            >
                                Load
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        );
    }

    if (matchFormData.loading || !validMatch || loadingMatchData || (matchDataError && error !== false) || teamName === null || eventName === null) {
        return (
            <Center>
                <Spinner></Spinner>
            </Center>
        );
    }

    return (
        <Box margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
            <Center>
                <HStack marginBottom={'25px'} spacing={'10px'}>
                    <Button disabled={activeSlider === 0 || activeSlider === null} className='slider-button-prev' _focus={{ outline: 'none' }}>
                        Prev
                    </Button>
                    <Text textAlign={'center'} color={submitAttempted && !matchFormData.followUp && !validateTab(tabs[activeSlider]) ? 'red' : 'black'} minW={'90px'} fontWeight={'bold'} fontSize={'110%'}>
                        {tabs[activeSlider]}
                    </Text>
                    <Button className='slider-button-next' _focus={{ outline: 'none' }}>
                        Next
                    </Button>
                </HStack>
            </Center>
            <Swiper
                // install Swiper modules
                ref={swiper}
                autoHeight={true}
                modules={[Navigation]}
                spaceBetween={50}
                centeredSlides={true}
                slidesPerView={'auto'}
                simulateTouch={false}
                noSwiping={true}
                navigation={{ prevEl: '.slider-button-prev', nextEl: '.slider-button-next' }}
                onSlideChange={(swiper) => {
                    setActiveSlider(swiper.activeIndex);
                }}
            >
                <SwiperSlide> {renderTab('Pre-Auto')}</SwiperSlide>
                <SwiperSlide> {renderTab('Auto')}</SwiperSlide>
                <SwiperSlide> {renderTab('Post-Auto')}</SwiperSlide>
                <SwiperSlide> {renderTab('Teleop')}</SwiperSlide>
                <SwiperSlide> {renderTab('Post')}</SwiperSlide>
            </Swiper>
        </Box>
    );
}

export default MatchForm;
