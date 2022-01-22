import { React, useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Center, Flex, HStack, Menu, MenuButton, MenuItem, MenuList, NumberInput, NumberInputField, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Spinner, Text, Textarea, useUpdateEffect } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDownIcon } from '@chakra-ui/icons';
import Field from '../images/Field.png';
import CustomMinusButton from '../components/CustomMinusButton';
import CustomPlusButton from '../components/CustomPlusButton';
import StopWatch from '../components/StopWatch';
import { UPDATE_MATCHFORM } from '../graphql/mutations';
import { useMutation, useQuery } from '@apollo/client';
import { GET_MATCHFORM_STATION_QUERY } from '../graphql/queries';

let tabs = ['Auto', 'Teleop', 'Post'];
let stations = ['Red Station 1', 'Red Station 2', 'Red Station 3', 'Blue Station 1', 'Blue Station 2', 'Blue Station 3'];
let matchTypes = ['Quals', 'Quarters', 'Semis', 'Finals'];
let rungs = ['Low Rung', 'Mid Rung', 'High Rung', 'Traversal Rung', 'Failed'];
let defenseRatings = [0, 1, 2, 3, 4, 5];

function MatchForm() {
    let navigate = useNavigate();
    let { eventKey: eventKeyParam, matchNumber: matchNumberParam, station: stationParam } = useParams();
    const canvas = useRef(null);

    const [validMatch, setValidMatch] = useState(false);
    const [error, setError] = useState(false);
    const [tab, setTab] = useState('Auto');
    const [imagePrevDimensions, _setImagePrevDimensions] = useState({ x: 810, y: 414 });
    const imagePrevDimensionsRef = useRef(imagePrevDimensions);
    const setImagePrevDimensions = (data) => {
        imagePrevDimensionsRef.current = data;
        _setImagePrevDimensions(data);
    };
    const [station, setStation] = useState('');
    const [focusedStation, setFocusedStation] = useState('');
    const [matchType, setMatchType] = useState('');
    const [focusedMatchType, setFocusedMatchType] = useState('');
    const [matchNumber1, setMatchNumber1] = useState('');
    const [matchNumber2, setMatchNumber2] = useState('');
    const [teamNumber, setTeamNumber] = useState('');
    const [teamName, setTeamName] = useState('');
    const [teamConfirmed, setTeamConfirmed] = useState(false);
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

    const { loading: loadingMatchData } = useQuery(GET_MATCHFORM_STATION_QUERY, {
        skip: !validMatch,
        fetchPolicy: 'network-only',
        variables: {
            eventKey: eventKeyParam,
            matchNumber: matchNumberParam,
            station: stationParam,
        },
        onError(err) {
            if (err.message !== 'Error: Match form does not exist') {
                console.log(JSON.stringify(err, null, 2));
                setError(true);
            }
        },
        onCompleted({ getMatchForm: matchForm }) {
            setStation(matchForm.station);
            setMatchType(matchForm.matchType);
        },
    });

    useEffect(() => {
        fetch(`/blueAlliance/match/${eventKeyParam}_${convertMatchNumberToBlueAPI(matchNumberParam)}/simple`)
            .then((response) => response.json())
            .then((data) => {
                if (!data.Error) {
                    let stationColor = stationParam.charAt(0);
                    let stationNumber = parseInt(stationParam.charAt(1)) - 1;
                    let teamKey;
                    if (stationColor === 'r') {
                        teamKey = data.alliances.red.team_keys[stationNumber];
                    } else {
                        teamKey = data.alliances.blue.team_keys[stationNumber];
                    }
                    setTeamNumber(teamKey.substring(3));
                    setValidMatch(true);
                } else {
                    console.error('Error:', data.Error);
                    setError(true);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                setError(true);
            });
    }, []);

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
        return (screenWidth / 60) * scale;
    }

    const drawPoint = useCallback((x, y) => {
        setStartingPosition({ x: x, y: y });
        let ctx = canvas.current.getContext('2d');
        ctx.lineWidth = '1';
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
        doResize = setTimeout(drawImage, 250);
    }, [drawImage]);

    useEffect(() => {
        if (tab === 'Auto') {
            drawImage(null, null, true);
        }
    }, [tab, teamConfirmed, drawImage]);

    useEffect(() => {
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    useEffect(() => {
        function getTeamNumber() {
            if (station === '' || matchType === '') return;
            let matchKey;
            switch (matchType) {
                case 'Quals':
                    if (matchNumber1 === '') {
                        setTeamNumber('');
                        return;
                    }
                    matchKey = `qm${matchNumber1}`;
                    break;
                case 'Quarters':
                    if (matchNumber1 === '' || matchNumber2 === '') {
                        setTeamNumber('');
                        return;
                    }
                    matchKey = `qf${matchNumber1}m${matchNumber2}`;
                    break;
                case 'Semis':
                    if (matchNumber1 === '' || matchNumber2 === '') {
                        setTeamNumber('');
                        return;
                    }
                    matchKey = `sf${matchNumber1}m${matchNumber2}`;
                    break;
                case 'Finals':
                    if (matchNumber1 === '' || matchNumber2 === '') {
                        setTeamNumber('');
                        return;
                    }
                    matchKey = `f${matchNumber1}m${matchNumber2}`;
                    break;
                default:
                    setTeamNumber('');
                    return;
            }
            fetch(`blueAlliance/match/2019nyny_${matchKey}`)
                .then((response) => response.json())
                .then((data) => {
                    switch (station) {
                        case 'Red Station 1':
                            setTeamNumber(data.alliances.red.team_keys[0].substring(3));
                            break;
                        case 'Red Station 2':
                            setTeamNumber(data.alliances.red.team_keys[1].substring(3));
                            break;
                        case 'Red Station 3':
                            setTeamNumber(data.alliances.red.team_keys[2].substring(3));
                            break;
                        case 'Blue Station 1':
                            setTeamNumber(data.alliances.blue.team_keys[0].substring(3));
                            break;
                        case 'Blue Station 2':
                            setTeamNumber(data.alliances.blue.team_keys[1].substring(3));
                            break;
                        case 'Blue Station 3':
                            setTeamNumber(data.alliances.blue.team_keys[2].substring(3));
                            break;
                        default:
                            setTeamNumber('');
                    }
                })
                .catch((error) => {
                    setTeamNumber('');
                    console.error('Error:', error);
                });
        }
        getTeamNumber();
    }, [station, matchType, matchNumber1, matchNumber2]);

    function validSetup() {
        return station !== '' && matchType !== '' && matchNumber1 !== '' && (matchType !== 'Quals' ? matchNumber2 !== '' : true) && teamNumber !== '';
    }

    function validAuto() {
        return preLoadedCargo !== '' && startingPosition.x !== null && startingPosition.y !== null && crossTarmac !== '';
    }

    function validTele() {
        return climbTime > 0 ? climbRung !== '' : true;
    }

    function validForm() {
        return validSetup() && validAuto() && validTele();
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

    function convertMatchNumberToBlueAPI(matchNumber) {
        try {
            let matchParts = matchNumber.split('_');
            let matchType = matchParts[0];
            let matchNumber1 = matchParts[1];
            let matchNumber2;
            if (matchType !== 'Quals') {
                matchNumber2 = matchParts[2];
            }
            if (matchType === 'Quals') {
                return 'qm' + matchNumber2;
            } else if (matchType === 'Quarters') {
                return 'qf' + matchNumber1 + 'm' + matchNumber2;
            } else if (matchType === 'Semis') {
                return 'sf' + matchNumber1 + 'm' + matchNumber2;
            } else if (matchType === 'Finals') {
                return 'f' + matchNumber1 + 'm' + matchNumber2;
            } else {
                return 'Error';
            }
        } catch (err) {
            console.error(err);
            return 'Error';
        }
    }

    function createMatchNumber() {
        return matchType + '_' + matchNumber1 + (matchType !== 'Quals' ? '_' + matchNumber2 : '');
    }

    const [updateMatchForm] = useMutation(UPDATE_MATCHFORM, {
        onCompleted() {
            navigate('/');
        },
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
        },
    });

    function submit() {
        setSubmitAttempted(true);
        if (!validForm()) {
            return;
        }
        if (teamName === '') {
            fetch(`blueAlliance/team/frc${parseInt(teamNumber)}/simple`)
                .then((response) => response.json())
                .then((data) => {
                    setTeamName(data.nickname);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
        updateMatchForm({
            variables: {
                matchFormInput: {
                    eventKey: '2022nyny',
                    eventName: 'New York City Regional',
                    station: station,
                    matchNumber: createMatchNumber(),
                    teamNumber: parseInt(teamNumber),
                    teamName: teamName,
                    preLoadedCargo: preLoadedCargo,
                    startingPosition: startingPosition,
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
                                onPointerDown={(event) => {
                                    var bounds = event.target.getBoundingClientRect();
                                    var x = event.clientX - bounds.left;
                                    var y = event.clientY - bounds.top;
                                    drawImage(x, y);
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
                return <Center>Error</Center>;
        }
    }

    return (
        <Box margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
            {!teamConfirmed ? (
                <Box>
                    <Box border={'black solid'} borderRadius={'10px'} padding={'10px'}>
                        <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                            Competition: New York City Regional
                        </Text>
                        <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                            Alliance Station:
                        </Text>
                        <Menu>
                            <MenuButton
                                marginLeft={'10px'}
                                onClick={() => setFocusedStation('')}
                                _focus={{ outline: 'none' }}
                                textOverflow={'ellipsis'}
                                whiteSpace={'nowrap'}
                                overflow={'hidden'}
                                textAlign={'center'}
                                as={Button}
                                rightIcon={<ChevronDownIcon />}
                            >
                                {station === '' ? 'Choose Station' : station}
                            </MenuButton>
                            <MenuList textAlign={'center'}>
                                {stations.map((stationItem, index) => (
                                    <MenuItem
                                        _focus={{ backgroundColor: 'none' }}
                                        onMouseEnter={() => setFocusedStation(stationItem)}
                                        backgroundColor={(station === stationItem && focusedStation === '') || focusedStation === stationItem ? 'gray.100' : 'none'}
                                        maxW={'80vw'}
                                        textAlign={'center'}
                                        key={index}
                                        onClick={() => setStation(stationItem)}
                                    >
                                        {stationItem}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </Menu>
                        <Text marginTop={'20px'} marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                            Match Number:
                        </Text>
                        <Menu>
                            <MenuButton
                                marginLeft={'10px'}
                                onClick={() => setFocusedMatchType('')}
                                _focus={{ outline: 'none' }}
                                textOverflow={'ellipsis'}
                                whiteSpace={'nowrap'}
                                overflow={'hidden'}
                                textAlign={'center'}
                                as={Button}
                                rightIcon={<ChevronDownIcon />}
                            >
                                {matchType === '' ? 'Choose Match Type' : matchType}
                            </MenuButton>
                            <MenuList textAlign={'center'}>
                                {matchTypes.map((matchTypeItem, index) => (
                                    <MenuItem
                                        _focus={{ backgroundColor: 'none' }}
                                        onMouseEnter={() => setFocusedMatchType(matchTypeItem)}
                                        backgroundColor={(matchType === matchTypeItem && focusedMatchType === '') || focusedMatchType === matchTypeItem ? 'gray.100' : 'none'}
                                        maxW={'80vw'}
                                        textAlign={'center'}
                                        key={index}
                                        onClick={() => {
                                            setMatchNumber1('');
                                            setMatchNumber2('');
                                            setMatchType(matchTypeItem);
                                        }}
                                    >
                                        {matchTypeItem}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </Menu>
                        <HStack marginTop={'10px'}>
                            {matchType !== '' ? (
                                <NumberInput marginLeft={'10px'} onChange={(value) => setMatchNumber1(value)} value={matchNumber1} min={1} precision={0} width={{ base: matchType === 'Quals' ? '75%' : '45%', md: '66%', lg: '50%' }}>
                                    <NumberInputField _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }} textAlign={'center'} placeholder='Enter Match #' />
                                </NumberInput>
                            ) : null}
                            {matchType === 'Quals' || matchType === '' ? null : <Text>-</Text>}
                            {matchType === 'Quals' || matchType === '' ? null : (
                                <NumberInput marginLeft={'10px'} onChange={(value) => setMatchNumber2(value)} value={matchNumber2} min={1} precision={0} width={{ base: matchType === 'Quals' ? '75%' : '45%', md: '66%', lg: '50%' }}>
                                    <NumberInputField _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }} textAlign={'center'} placeholder='Enter Match #' />
                                </NumberInput>
                            )}
                        </HStack>
                        <Text marginTop={'10px'} marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                            Team Number: {teamNumber}
                        </Text>
                    </Box>
                    <Center>
                        <Button disabled={!validSetup()} _focus={{ outline: 'none' }} marginBottom={'20px'} marginTop={'20px'} onClick={() => setTeamConfirmed(true)}>
                            Confirm
                        </Button>
                    </Center>
                </Box>
            ) : (
                <Box>
                    <Center>
                        <HStack marginBottom={'25px'}>
                            {tabs.map((tabItem, index) => (
                                <Button border={submitAttempted && !validateTab(tabItem) ? '2px red solid' : 'none'} colorScheme={tab === tabItem ? 'green' : 'gray'} key={index} _focus={{ outline: 'none' }} onClick={() => setTab(tabItem)}>
                                    {tabItem}
                                </Button>
                            ))}
                        </HStack>
                    </Center>
                    {renderTab(tab)}
                </Box>
            )}
        </Box>
    );
}

export default MatchForm;
