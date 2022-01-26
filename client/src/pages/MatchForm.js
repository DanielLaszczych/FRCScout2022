import { React, useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Center, Flex, HStack, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Spinner, Text, Textarea } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import Field from '../images/Field.png';
import CustomMinusButton from '../components/CustomMinusButton';
import CustomPlusButton from '../components/CustomPlusButton';
import StopWatch from '../components/StopWatch';
import { UPDATE_MATCHFORM } from '../graphql/mutations';
import { useMutation, useQuery } from '@apollo/client';
import { GET_EVENT, GET_MATCHFORM_BY_STATION } from '../graphql/queries';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import '../stylesheets/matchformstyle.css';

let tabs = ['Auto', 'Teleop', 'Post'];
let rungs = ['Low Rung', 'Mid Rung', 'High Rung', 'Traversal Rung', 'Failed'];
let defenseRatings = [0, 1, 2, 3, 4, 5];

function MatchForm() {
    let navigate = useNavigate();
    let { eventKey: eventKeyParam, matchNumber: matchNumberParam, station: stationParam } = useParams();
    const canvas = useRef(null);

    const [sliding, setSliding] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const [validMatch, setValidMatch] = useState(false);
    const [validEvent, setValidEvent] = useState(false);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState(null);
    const [imagePrevDimensions, _setImagePrevDimensions] = useState({ x: 810, y: 414 });
    const imagePrevDimensionsRef = useRef(imagePrevDimensions);
    const setImagePrevDimensions = (data) => {
        imagePrevDimensionsRef.current = data;
        _setImagePrevDimensions(data);
    };
    const [eventName, setEventName] = useState('');
    const [teamNumber, setTeamNumber] = useState('');
    const [teamName, setTeamName] = useState('');
    const [preLoadedCargo, setPreLoadedCargo] = useState('');
    const [startingPosition, _setStartingPosition] = useState({ x: null, y: null });
    const startingPositionRef = useRef(startingPosition);
    const setStartingPosition = (data) => {
        startingPositionRef.current = data;
        _setStartingPosition(data);
    };
    const [lowerCargoAuto, setLowerCargoAuto] = useState(0);
    const [upperCargoAuto, setUpperCargoAuto] = useState(0);
    const [crossTarmac, setCrossTarmac] = useState('');
    const [autoComment, setAutoComment] = useState('');
    const [lowerCargoTele, setLowerCargoTele] = useState(0);
    const [upperCargoTele, setUpperCargoTele] = useState(0);
    const [climbTime, setClimbTime] = useState(0);
    const [climbRung, setClimbRung] = useState('');
    const [defenseRating, setDefenseRating] = useState(0);
    const [loseCommunication, setLoseCommunication] = useState(false);
    const [robotBreak, setRobotBreak] = useState(false);
    const [yellowCard, setYellowCard] = useState(false);
    const [redCard, setRedCard] = useState(false);
    const [endComment, setEndComment] = useState('');
    const [submitAttempted, setSubmitAttempted] = useState(false);

    useEffect(() => {
        if (!/[rb][123]/.test(stationParam)) {
            setError('Invalid station in the url');
            return;
        }
        fetch(`/blueAlliance/match/${eventKeyParam}_${matchNumberParam}/simple`)
            .then((response) => response.json())
            .then((data) => {
                if (!data.Error) {
                    let stationNumber = parseInt(stationParam.charAt(1)) - 1;
                    let teamKey;
                    if (stationParam.charAt(0) === 'r') {
                        teamKey = data.alliances.red.team_keys[stationNumber];
                    } else {
                        teamKey = data.alliances.blue.team_keys[stationNumber];
                    }
                    setTeamNumber(teamKey.substring(3));
                    setValidMatch(true);
                } else {
                    setError(data.Error);
                }
            })
            .catch((error) => {
                setError(error);
            });
    }, [eventKeyParam, matchNumberParam, stationParam]);

    const { loading: loadingEvent, error: eventError } = useQuery(GET_EVENT, {
        skip: !validMatch,
        fetchPolicy: 'network-only',
        variables: {
            key: eventKeyParam,
        },
        onCompleted({ getEvent: event }) {
            setEventName(event.name);
            setValidEvent(true);
        },
        onError(err) {
            if (err.message === 'Error: Event is not registered inside database') {
                setError('This event is not registered inside our database');
            } else {
                console.log(JSON.stringify(err, null, 2));
                setError('Apollo error, check console for logs');
            }
        },
    });

    const { loading: loadingMatchData, error: matchDataError } = useQuery(GET_MATCHFORM_BY_STATION, {
        skip: !validEvent || !validMatch,
        fetchPolicy: 'network-only',
        variables: {
            eventKey: eventKeyParam,
            matchNumber: matchNumberParam,
            station: stationParam,
        },
        onError(err) {
            if (err.message === 'Error: Match form does not exist') {
                setError(false);
                setTab('Auto');
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
            } else {
                console.log(JSON.stringify(err, null, 2));
                setError('Apollo error, check console for logs');
            }
        },
        onCompleted({ getMatchFormByStation: matchForm }) {
            setTeamName(matchForm.teamName);
            setPreLoadedCargo(matchForm.preLoadedCargo);
            setImagePrevDimensions({ x: matchForm.startingPosition.width, y: matchForm.startingPosition.height });
            setStartingPosition({ x: matchForm.startingPosition.x, y: matchForm.startingPosition.y });
            setLowerCargoAuto(matchForm.lowerCargoAuto);
            setUpperCargoAuto(matchForm.upperCargoAuto);
            setCrossTarmac(matchForm.crossTarmac);
            setAutoComment(matchForm.autoComment);
            setLowerCargoTele(matchForm.lowerCargoTele);
            setUpperCargoTele(matchForm.upperCargoTele);
            setClimbTime(matchForm.climbTime);
            setClimbRung(matchForm.climbRung);
            setDefenseRating(matchForm.defenseRating);
            setLoseCommunication(matchForm.loseCommunication);
            setRobotBreak(matchForm.robotBreak);
            setYellowCard(matchForm.yellowCard);
            setRedCard(matchForm.redCard);
            setEndComment(matchForm.endComment);
            setTab('Auto');
        },
    });

    useEffect(() => {
        if (climbTime === 0) {
            setClimbRung('');
        }
    }, [climbTime]);

    function calculateImageScale() {
        let scale;
        let screenWidth = document.documentElement.clientWidth || document.body.clientWidth;
        if (screenWidth < 768) {
            scale = 0.8;
        } else if (screenWidth < 992) {
            scale = 0.61;
        } else {
            scale = 0.45;
        }
        return (screenWidth / 810) * scale;
    }

    function calculateCircleRadius() {
        let scale;
        let screenWidth = document.documentElement.clientWidth || document.body.clientWidth;
        if (screenWidth < 768) {
            scale = 0.8;
        } else if (screenWidth < 992) {
            scale = 0.61;
        } else {
            scale = 0.45;
        }
        return (screenWidth / 40) * scale;
    }

    const drawPoint = useCallback((x, y) => {
        setStartingPosition({ x: x, y: y });
        let ctx = canvas.current.getContext('2d');
        ctx.lineWidth = '4';
        ctx.strokeStyle = 'green';
        ctx.beginPath();
        ctx.arc(x, y, calculateCircleRadius(), 0, 2 * Math.PI);
        ctx.stroke();
    }, []);

    const drawImage = useCallback(
        (x = null, y = null, fromTab = false) => {
            const canvasElement = canvas.current;
            if (canvas.current !== null) {
                const ctx = canvas.current.getContext('2d');
                let prevWidth = fromTab ? imagePrevDimensionsRef.current.x : canvasElement.width;
                let prevHeight = fromTab ? imagePrevDimensionsRef.current.y : canvasElement.height;
                let img = new Image();
                img.src = Field;
                img.onload = () => {
                    let scale = calculateImageScale();
                    canvasElement.width = 810 * scale;
                    canvasElement.height = 414 * scale;
                    setImagePrevDimensions({ x: canvasElement.width, y: canvasElement.height });
                    ctx.drawImage(img, 0, 0, 810 * scale, 414 * scale);
                    if (x && y) {
                        drawPoint(x, y);
                    } else if (startingPositionRef.current.x && startingPositionRef.current.y) {
                        let transformX = canvasElement.width / prevWidth;
                        let transformY = canvasElement.height / prevHeight;
                        drawPoint(startingPositionRef.current.x * transformX, startingPositionRef.current.y * transformY);
                    }
                };
            }
        },
        [drawPoint]
    );

    const resizeCanvas = useCallback(() => {
        let doResize;
        clearTimeout(doResize);
        doResize = setTimeout(drawImage(null, null, true), 250);
    }, [drawImage]);

    useEffect(() => {
        console.log(activeIndex);
        if (activeIndex === 0) {
            drawImage(null, null, true);
        }
    }, [drawImage, activeIndex]);

    useEffect(() => {
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    function validAuto() {
        return preLoadedCargo !== '' && startingPosition.x !== null && startingPosition.y !== null && crossTarmac !== '';
    }

    function validTele() {
        return climbTime > 0 ? climbRung !== '' : true;
    }

    function validForm() {
        return validAuto() && validTele();
    }

    function validateTab(tab) {
        if (tab === 'Auto') {
            return validAuto();
        } else if (tab === 'Teleop') {
            return validTele();
        } else {
            return true;
        }
    }

    const [updateMatchForm] = useMutation(UPDATE_MATCHFORM, {
        onCompleted() {
            navigate('/');
        },
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, check console for logs');
        },
    });

    function submit() {
        setSubmitAttempted(true);
        if (!validForm()) {
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
                    preLoadedCargo: preLoadedCargo,
                    startingPosition: { ...startingPosition, width: imagePrevDimensions.x, height: imagePrevDimensions.y },
                    lowerCargoAuto: lowerCargoAuto,
                    upperCargoAuto: upperCargoAuto,
                    crossTarmac: crossTarmac,
                    autoComment: autoComment,
                    lowerCargoTele: lowerCargoTele,
                    upperCargoTele: upperCargoTele,
                    climbTime: climbTime,
                    climbRung: climbRung,
                    defenseRating: defenseRating,
                    loseCommunication: loseCommunication,
                    robotBreak: robotBreak,
                    yellowCard: yellowCard,
                    redCard: redCard,
                    endComment: endComment,
                },
            },
        });
    }

    function renderTab(tab) {
        switch (tab) {
            case 'Auto':
                return (
                    <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                        <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                            Pre-Loaded Ball:
                        </Text>
                        <HStack marginBottom={'20px'} marginLeft={'25px'} spacing={'30px'}>
                            <Button _focus={{ outline: 'none' }} colorScheme={preLoadedCargo === true ? 'green' : 'gray'} onClick={() => setPreLoadedCargo(true)}>
                                Yes
                            </Button>
                            <Button _focus={{ outline: 'none' }} colorScheme={preLoadedCargo === false ? 'green' : 'gray'} onClick={() => setPreLoadedCargo(false)}>
                                No
                            </Button>
                        </HStack>
                        <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                            Starting Position:
                        </Text>
                        <Center marginBottom={'20px'}>
                            <Spinner pos={'absolute'} zIndex={-1}></Spinner>
                            <canvas
                                style={{ zIndex: 2 }}
                                width={810 * calculateImageScale()}
                                height={414 * calculateImageScale()}
                                onClick={(event) => {
                                    if (canvas.current !== undefined) {
                                        console.log('put point down');
                                        var bounds = event.target.getBoundingClientRect();
                                        var x = event.clientX - bounds.left;
                                        var y = event.clientY - bounds.top;
                                        drawImage(x, y);
                                    } else {
                                        event.preventDefault();
                                    }
                                }}
                                ref={canvas}
                            ></canvas>
                        </Center>
                        <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                            Lower Hub:
                        </Text>
                        <Center marginBottom={'20px'}>
                            <HStack>
                                <CustomMinusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setLowerCargoAuto((prevCargo) => (prevCargo === 0 ? 0 : prevCargo - 1))} />
                                <Text minW={{ base: '54px', md: '54px', lg: '54px' }} fontSize={'50px'} textAlign={'center'}>
                                    {lowerCargoAuto}
                                </Text>
                                <CustomPlusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setLowerCargoAuto((prevCargo) => prevCargo + 1)} />
                            </HStack>
                        </Center>
                        <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                            Upper Hub:
                        </Text>
                        <Center marginBottom={'20px'}>
                            <HStack>
                                <CustomMinusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setUpperCargoAuto((prevCargo) => (prevCargo === 0 ? 0 : prevCargo - 1))} />
                                <Text minW={{ base: '54px', md: '54px', lg: '54px' }} fontSize={'50px'} textAlign={'center'}>
                                    {upperCargoAuto}
                                </Text>
                                <CustomPlusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setUpperCargoAuto((prevCargo) => prevCargo + 1)} />
                            </HStack>
                        </Center>
                        <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                            Cross Tarmac:
                        </Text>
                        <HStack marginBottom={'20px'} marginLeft={'25px'} spacing={'30px'}>
                            <Button _focus={{ outline: 'none' }} colorScheme={crossTarmac === true ? 'green' : 'gray'} onClick={() => setCrossTarmac(true)}>
                                Yes
                            </Button>
                            <Button _focus={{ outline: 'none' }} colorScheme={crossTarmac === false ? 'green' : 'gray'} onClick={() => setCrossTarmac(false)}>
                                No
                            </Button>
                        </HStack>
                        <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                            Auto Comment:
                        </Text>
                        <Center marginBottom={'10px'}>
                            <Textarea _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }} onChange={(event) => setAutoComment(event.target.value)} value={autoComment} placeholder='Any comments about auto' w={'85%'}></Textarea>
                        </Center>
                    </Box>
                );
            case 'Teleop':
                return (
                    <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                        <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                            Lower Hub:
                        </Text>
                        <Center marginBottom={'20px'}>
                            <HStack>
                                <CustomMinusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setLowerCargoTele((prevCargo) => (prevCargo === 0 ? 0 : prevCargo - 1))} />
                                <Text minW={{ base: '54px', md: '54px', lg: '54px' }} fontSize={'50px'} textAlign={'center'}>
                                    {lowerCargoTele}
                                </Text>
                                <CustomPlusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setLowerCargoTele((prevCargo) => prevCargo + 1)} />
                            </HStack>
                        </Center>
                        <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                            Upper Hub:
                        </Text>
                        <Center marginBottom={'20px'}>
                            <HStack>
                                <CustomMinusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setUpperCargoTele((prevCargo) => (prevCargo === 0 ? 0 : prevCargo - 1))} />
                                <Text minW={{ base: '54px', md: '54px', lg: '54px' }} fontSize={'50px'} textAlign={'center'}>
                                    {upperCargoTele}
                                </Text>
                                <CustomPlusButton fontSize={{ base: '30px', md: '40px', lg: '40px' }} onClick={() => setUpperCargoTele((prevCargo) => prevCargo + 1)} />
                            </HStack>
                        </Center>
                        <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                            Climb:
                        </Text>
                        <Center marginBottom={'10px'}>
                            <StopWatch setParentTimer={setClimbTime} initTime={climbTime}></StopWatch>
                        </Center>
                        {climbTime > 0 ? (
                            <Box>
                                <Text marginBottom={'10px'} marginLeft={'10px'} fontWeight={'bold'} fontSize={'100%'}>
                                    Where:
                                </Text>
                                <Center>
                                    <Flex flexWrap={'wrap'} marginBottom={'2px'} justifyContent={'center'}>
                                        {rungs.map((rung, index) => (
                                            <Button maxW={'125px'} minW={'125px'} margin={'8px'} key={index} _focus={{ outline: 'none' }} colorScheme={climbRung === rung ? 'green' : 'gray'} onClick={() => setClimbRung(rung)}>
                                                {rung}
                                            </Button>
                                        ))}
                                    </Flex>
                                </Center>
                            </Box>
                        ) : null}
                    </Box>
                );
            case 'Post':
                return (
                    <Box>
                        <Box border={'black solid'} borderRadius={'10px'} padding={'10px'}>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Defense:
                            </Text>
                            <Center marginBottom={'30px'}>
                                <Slider colorScheme={'green'} w={'80%'} value={defenseRating} min={0} max={5} step={1} onChange={(value) => setDefenseRating(value)}>
                                    {defenseRatings.map((rating, index) => (
                                        <SliderMark mr={rating === 0 ? 'px' : '0px'} mt={'10px'} key={index} value={rating}>
                                            {rating === 0 ? 'None' : rating}
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
                                <Button _focus={{ outline: 'none' }} colorScheme={loseCommunication === true ? 'green' : 'gray'} onClick={() => setLoseCommunication(true)}>
                                    Yes
                                </Button>
                                <Button _focus={{ outline: 'none' }} colorScheme={loseCommunication === false ? 'green' : 'gray'} onClick={() => setLoseCommunication(false)}>
                                    No
                                </Button>
                            </HStack>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Robot broke:
                            </Text>
                            <HStack marginBottom={'20px'} marginLeft={'25px'} spacing={'30px'}>
                                <Button _focus={{ outline: 'none' }} colorScheme={robotBreak === true ? 'green' : 'gray'} onClick={() => setRobotBreak(true)}>
                                    Yes
                                </Button>
                                <Button _focus={{ outline: 'none' }} colorScheme={robotBreak === false ? 'green' : 'gray'} onClick={() => setRobotBreak(false)}>
                                    No
                                </Button>
                            </HStack>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Yellow Card:
                            </Text>
                            <HStack marginBottom={'20px'} marginLeft={'25px'} spacing={'30px'}>
                                <Button _focus={{ outline: 'none' }} colorScheme={yellowCard === true ? 'green' : 'gray'} onClick={() => setYellowCard(true)}>
                                    Yes
                                </Button>
                                <Button _focus={{ outline: 'none' }} colorScheme={yellowCard === false ? 'green' : 'gray'} onClick={() => setYellowCard(false)}>
                                    No
                                </Button>
                            </HStack>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Red Card:
                            </Text>
                            <HStack marginBottom={'20px'} marginLeft={'25px'} spacing={'30px'}>
                                <Button _focus={{ outline: 'none' }} colorScheme={redCard === true ? 'green' : 'gray'} onClick={() => setRedCard(true)}>
                                    Yes
                                </Button>
                                <Button _focus={{ outline: 'none' }} colorScheme={redCard === false ? 'green' : 'gray'} onClick={() => setRedCard(false)}>
                                    No
                                </Button>
                            </HStack>
                            <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                                Ending Comment:
                            </Text>
                            <Center marginBottom={'10px'}>
                                <Textarea _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }} onChange={(event) => setEndComment(event.target.value)} value={endComment} placeholder='Any ending comments' w={'85%'}></Textarea>
                            </Center>
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

    if (!validMatch || !validEvent || loadingMatchData || loadingEvent || ((matchDataError || eventError) && error !== false)) {
        return (
            <Center>
                <Spinner></Spinner>
            </Center>
        );
    }

    return (
        <Center>
            <Box width={{ base: '85%', md: '66%', lg: '50%' }}>
                <Center>
                    <HStack marginBottom={'25px'}>
                        {tabs.map((tabItem, index) => (
                            <Button border={submitAttempted && !validateTab(tabItem) ? '2px red solid' : 'none'} colorScheme={tab === tabItem ? 'green' : 'gray'} key={index} _focus={{ outline: 'none' }} onClick={() => setTab(tabItem)}>
                                {tabItem}
                            </Button>
                        ))}
                    </HStack>
                </Center>
                <Button className='slider-button-prev'>Prev</Button>
                <Button className='slider-button-next'>Next</Button>
                <Swiper
                    // install Swiper modules
                    autoHeight={true}
                    modules={[Navigation]}
                    simulateTouch={true}
                    spaceBetween={50}
                    centeredSlides={true}
                    slidesPerView={1}
                    navigation={{ prevEl: '.slider-button-prev', nextEl: '.slider-button-next' }}
                    onSwiper={(swiper) => {
                        // console.log(swiper);
                        setActiveIndex(swiper.activeIndex);
                    }}
                    onSlideChange={(swiper) => {
                        // console.log(swiper);
                        setActiveIndex(swiper.activeIndex);
                        setSliding(false);
                    }}
                    onTouchMove={(touchmove) => {
                        // console.log(touchmove);
                        if (!sliding) {
                            setSliding(true);
                        }
                    }}
                >
                    <SwiperSlide> {renderTab('Auto')}</SwiperSlide>
                    <SwiperSlide> {renderTab('Teleop')}</SwiperSlide>
                    <SwiperSlide> {renderTab('Post')}</SwiperSlide>
                </Swiper>
            </Box>
        </Center>
    );
}

export default MatchForm;
