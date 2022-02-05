import { React, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { GET_EVENT, GET_PITFORM } from '../graphql/queries';
import { UPDATE_PITFORM } from '../graphql/mutations';
import {
    Text,
    Textarea,
    Checkbox,
    Grid,
    GridItem,
    Button,
    Center,
    VStack,
    Radio,
    RadioGroup,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Box,
    HStack,
    Stack,
    Spinner,
    useToast,
    Image,
    useDisclosure,
    Popover,
    PopoverTrigger,
    PopoverArrow,
    PopoverCloseButton,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Circle,
} from '@chakra-ui/react';
import { year } from '../util/constants';
import { AddIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';

let driveTrains = [
    { label: 'Tank', id: uuidv4() },
    { label: 'Swerve', id: uuidv4() },
    { label: 'Mecanum', id: uuidv4() },
    { label: 'H-Drive', id: uuidv4() },
];
let motorsList = [
    { label: 'Falcon 500', id: uuidv4() },
    { label: 'NEO', id: uuidv4() },
    { label: 'CIM', id: uuidv4() },
    { label: 'Mini-CIM', id: uuidv4() },
    { label: 'NEO 500', id: uuidv4() },
    { label: '775 Pro', id: uuidv4() },
];
let wheelsList = [
    { label: 'Traction', id: uuidv4() },
    { label: 'Omni', id: uuidv4() },
    { label: 'Colson', id: uuidv4() },
    { label: 'Pneumatic', id: uuidv4() },
    { label: 'Mecanum', id: uuidv4() },
];
let programmingLanguages = [
    { label: 'Java', id: uuidv4() },
    { label: 'C++', id: uuidv4() },
    { label: 'LabVIEW', id: uuidv4() },
];
let startingPositions = [
    { label: 'Fender', id: uuidv4() },
    { label: 'Tarmac Middle', id: uuidv4() },
    { label: 'Tarmac Edge', id: uuidv4() },
];
let taxiOptions = [
    { label: 'Yes', id: uuidv4() },
    { label: 'No', id: uuidv4() },
];
let holdingCapacities = [
    { label: '0', id: uuidv4() },
    { label: '1', id: uuidv4() },
    { label: '2', id: uuidv4() },
];

function PitForm() {
    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const [modalComment, setModalComment] = useState('');
    const { isOpen: isMotorsOpen, onOpen: onMotorsOpen, onClose: onMotorsClose } = useDisclosure();
    const [deletingMotors, setDeletingMotors] = useState(false);
    const { isOpen: isWheelsOpen, onOpen: onWheelsOpen, onClose: onWheelsClose } = useDisclosure();
    const [deletingWheels, setDeletingWheels] = useState(false);
    let { eventKey: eventKeyParam, teamNumber: teamNumberParam } = useParams();
    const hiddenImageInput = useRef(null);

    const [error, setError] = useState(null);
    const [validEvent, setValidEvent] = useState(false);
    const [imgHeader, setImgHeader] = useState('Same Image');
    const [dataLoaded, setDataLoaded] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [eventName, setEventName] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [driveTrain, setDriveTrain] = useState('');
    const [motors, setMotors] = useState([]);
    const [wheels, setWheels] = useState([]);
    const [driveTrainComment, setDriveTrainComment] = useState('');
    const [programmingLanguage, setProgrammingLanguage] = useState('');
    const [startingPosition, setStartingPosition] = useState('');
    const [taxi, setTaxi] = useState('');
    const [autoComment, setAutoComment] = useState('');
    const [abilities, setAbilities] = useState([
        { label: 'Deliver Cargo to Terminal', value: false, id: uuidv4() },
        { label: 'Receive Cargo from Terminal', value: false, id: uuidv4() },
        { label: 'Pick up Cargo from floor', value: false, id: uuidv4() },
        { label: 'Score Cargo into the Lower Hub', value: false, id: uuidv4() },
        { label: 'Score Cargo into the Upper Hub', value: false, id: uuidv4() },
        { label: 'Hang on Low Rung', value: false, id: uuidv4() },
        { label: 'Hang on Mid Rung', value: false, id: uuidv4() },
        { label: 'Hang on High Rung', value: false, id: uuidv4() },
        { label: 'Hang on Traversal Rung', value: false, id: uuidv4() },
    ]);
    const [holdingCapacity, setHoldingCapacity] = useState('');
    const [workingComment, setWorkingComment] = useState('');
    const [closingComment, setClosingComment] = useState('');
    const [image, setImage] = useState('');
    const [markedFollowUp, setMarkedFollowUp] = useState(false);
    const [followUpComment, setFollowUpComment] = useState('');
    const [submitAttempted, setSubmitAttempted] = useState(false);

    function handleSetWeight(value) {
        if (value.trim() !== '') {
            setWeight(twoPrecision(parseFloat(value)));
        }
    }

    function handleSetHeight(value) {
        if (value.trim() !== '') {
            setHeight(twoPrecision(parseFloat(value)));
        }
    }

    function handleAddMotor(motorName) {
        setMotors((prevMotors) => [
            ...prevMotors,
            {
                label: motorName,
                value: 0,
                id: uuidv4(),
            },
        ]);
    }

    function handleRemoveMotor(motorName) {
        setMotors((prevMotors) => {
            if (prevMotors.length === 1) {
                setDeletingMotors(false);
            }
            return prevMotors.filter((motor) => motor.label !== motorName);
        });
    }

    function handleDecrementMotor(motorLabel) {
        setMotors((prevMotors) =>
            prevMotors.map((motor) => {
                if (motorLabel === motor.label) {
                    return { ...motor, value: motor.value === 0 ? 0 : motor.value - 1 };
                } else {
                    return motor;
                }
            })
        );
    }

    function handleIncrementMotor(motorLabel) {
        setMotors((prevMotors) =>
            prevMotors.map((motor) => {
                if (motorLabel === motor.label) {
                    return { ...motor, value: motor.value + 1 };
                } else {
                    return motor;
                }
            })
        );
    }

    function handleAddWheel(wheelName) {
        setWheels((prevWheels) => [
            ...prevWheels,
            {
                label: wheelName,
                size: '',
                value: 0,
                id: uuidv4(),
            },
        ]);
    }

    function handleRemoveWheel(wheelName) {
        setWheels((prevWheels) => {
            if (prevWheels.length === 1) {
                setDeletingWheels(false);
            }
            return prevWheels.filter((wheel) => wheel.label !== wheelName);
        });
    }

    function handleDecrementWheel(wheelLabel) {
        setWheels((prevWheels) =>
            prevWheels.map((wheel) => {
                if (wheelLabel === wheel.label) {
                    return { ...wheel, value: wheel.value === 0 ? 0 : wheel.value - 1 };
                } else {
                    return wheel;
                }
            })
        );
    }

    function handleIncrementWheel(wheelLabel) {
        setWheels((prevWheels) =>
            prevWheels.map((wheel) => {
                if (wheelLabel === wheel.label) {
                    return { ...wheel, value: wheel.value + 1 };
                } else {
                    return wheel;
                }
            })
        );
    }

    function handleWheelSize(wheelLabel, wheelSize) {
        setWheels((prevWheels) =>
            prevWheels.map((wheel) => {
                if (wheelLabel === wheel.label) {
                    return { ...wheel, size: wheelSize };
                } else {
                    return wheel;
                }
            })
        );
    }

    function handleWheelSizeBlur(wheelLabel, wheelSize) {
        setWheels((prevWheels) =>
            prevWheels.map((wheel) => {
                if (wheelLabel === wheel.label && wheelSize.trim() !== '') {
                    return { ...wheel, size: twoPrecision(parseFloat(wheelSize)) };
                } else {
                    return wheel;
                }
            })
        );
    }

    function handleAbilityCheck(abilityLabel) {
        setAbilities((prevAbilities) =>
            prevAbilities.map((ability) => {
                if (abilityLabel === ability.label) {
                    return { ...ability, value: !ability.value };
                } else {
                    return ability;
                }
            })
        );
    }

    function updateImage(event) {
        if (event.target.files && event.target.files[0] && event.target.files[0].type.split('/')[0] === 'image') {
            var FR = new FileReader();
            FR.readAsDataURL(event.target.files[0]);
            FR.onload = () => {
                setImgHeader('New Image');
                setImage(FR.result);
            };
        }
    }

    function validMotors() {
        for (const motor of motors) {
            if (motor.value === 0) {
                return false;
            }
        }
        return true;
    }

    function validWheels() {
        for (const wheel of wheels) {
            if (wheel.value === 0 || wheel.size === '') {
                return false;
            }
        }
        return true;
    }

    function validForm() {
        return weight !== '' && height !== '' && driveTrain !== '' && validMotors() && validWheels() && programmingLanguage !== '' && startingPosition !== '' && taxi !== '' && holdingCapacity !== '';
    }

    const { loading: loadingEvent, error: eventError } = useQuery(GET_EVENT, {
        fetchPolicy: 'network-only',
        variables: {
            key: eventKeyParam,
        },
        onCompleted() {
            setValidEvent(true);
        },
        onError(err) {
            if (err.message === 'Error: Event is not registered inside database') {
                setError('This event is not registered in the database');
            } else {
                console.log(JSON.stringify(err, null, 2));
                setError('Apollo error, check console for logs');
            }
        },
    });

    const { loading: loadingPitForm, error: pitFormError } = useQuery(GET_PITFORM, {
        skip: !validEvent,
        fetchPolicy: 'network-only',
        variables: {
            eventKey: eventKeyParam,
            teamNumber: parseInt(teamNumberParam),
        },
        onError(err) {
            if (err.message === 'Error: Pit form does not exist') {
                setError(false);
                fetch(`/blueAlliance/team/frc${parseInt(teamNumberParam)}/simple`)
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
                fetch(`/blueAlliance/team/frc${parseInt(teamNumberParam)}/events/${year}/simple`)
                    .then((response) => response.json())
                    .then((data) => {
                        if (!data.Error) {
                            let event = data.find((event) => event.key === eventKeyParam);
                            if (event === undefined) {
                                setError('This team is not competing in this event');
                            } else {
                                setEventName(event.name);
                            }
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
        onCompleted({ getPitForm: pitForm }) {
            setTeamName(pitForm.teamName);
            setEventName(pitForm.eventName);
            setWeight(pitForm.weight || '');
            setHeight(pitForm.height || '');
            setDriveTrain(pitForm.driveTrain);
            let modifiedMotors = pitForm.motors.map((motor) => {
                return { label: motor.label, value: motor.value, id: uuidv4() };
            });
            setMotors(modifiedMotors);
            let modifiedWheels = pitForm.wheels.map((wheel) => {
                return { label: wheel.label, size: wheel.size === null ? '' : wheel.size.toString(), value: wheel.value, id: uuidv4() };
            });
            setWheels(modifiedWheels);
            setDriveTrainComment(pitForm.driveTrainComment);
            setProgrammingLanguage(pitForm.programmingLanguage);
            setStartingPosition(pitForm.startingPosition);
            setTaxi(pitForm.taxi);
            setAutoComment(pitForm.autoComment);
            let modifiedAbilities = pitForm.abilities.map((ability) => {
                return { label: ability.label, value: ability.value, id: uuidv4() };
            });
            setAbilities(modifiedAbilities);
            setHoldingCapacity(pitForm.holdingCapacity !== null ? pitForm.holdingCapacity.toString() : '');
            setWorkingComment(pitForm.workingComment);
            setClosingComment(pitForm.closingComment);
            setImage(pitForm.image);
            setMarkedFollowUp(pitForm.followUp);
            setFollowUpComment(pitForm.followUpComment);
            setDataLoaded(true);
        },
    });

    const [updatePitForm] = useMutation(UPDATE_PITFORM, {
        context: {
            headers: {
                imagetype: imgHeader,
            },
        },
        onCompleted() {
            toast({
                title: 'Pit Form Updated',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            navigate('/');
        },
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            toast({
                title: 'Apollo Error, check console',
                description: 'Call Daniel',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        },
    });

    function submit() {
        setSubmitAttempted(true);
        if (!validForm() && !markedFollowUp) {
            toast({
                title: 'Missing fields',
                description: 'Fill out all fields, otherwise mark for follow up',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        } else if (markedFollowUp && followUpComment.trim() === '') {
            toast({
                title: 'Missing fields',
                description: 'Leave a follow up comment',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        let modifiedMotors = motors.map((motor) => {
            return { label: motor.label, value: motor.value };
        });
        let modifiedWheels = wheels.map((wheel) => {
            return { label: wheel.label, size: parseFloat(wheel.size), value: wheel.value };
        });
        let modifiedAbilities = abilities.map((ability) => {
            return { label: ability.label, value: ability.value };
        });
        updatePitForm({
            variables: {
                pitFormInput: {
                    eventKey: eventKeyParam,
                    eventName: eventName,
                    teamNumber: parseInt(teamNumberParam),
                    teamName: teamName,
                    weight: parseFloat(weight),
                    height: parseFloat(height),
                    driveTrain: driveTrain,
                    motors: modifiedMotors,
                    wheels: modifiedWheels,
                    driveTrainComment: driveTrainComment,
                    programmingLanguage: programmingLanguage,
                    startingPosition: startingPosition,
                    taxi: taxi,
                    autoComment: autoComment,
                    abilities: modifiedAbilities,
                    holdingCapacity: parseInt(holdingCapacity),
                    workingComment: workingComment,
                    closingComment: closingComment,
                    image: image,
                    followUp: markedFollowUp,
                    followUpComment: markedFollowUp ? followUpComment : '',
                },
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

    if (!validEvent || loadingEvent || loadingPitForm || ((pitFormError || eventError) && error !== false) || (!dataLoaded ? eventName === '' || teamName === '' : false)) {
        return (
            <Center>
                <Spinner></Spinner>
            </Center>
        );
    }

    return (
        <Box margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
            <Circle backgroundColor={'gray.200'} zIndex={2} position={'fixed'} cursor={'pointer'} onClick={onModalOpen} bottom={'2%'} right={'2%'} padding={'10px'} borderRadius={'50%'} border={'2px solid black'}>
                <AddIcon fontSize={'150%'} />
            </Circle>
            <Modal lockFocusAcrossFrames={true} closeOnEsc={true} isOpen={isModalOpen} onClose={onModalClose}>
                <ModalOverlay>
                    <ModalContent margin={0} w={{ base: '75%', md: '40%', lg: '30%' }} top='25%'>
                        <ModalHeader color='black' fontSize='lg' fontWeight='bold'>
                            Write a comment
                        </ModalHeader>
                        <ModalBody maxHeight={'250px'} overflowY={'auto'}>
                            <Textarea _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }} onChange={(event) => setModalComment(event.target.value)} value={modalComment} placeholder='Comment...' />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                onClick={() => {
                                    onModalClose();
                                    setModalComment('');
                                }}
                                _focus={{ outline: 'none' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme='blue'
                                ml={3}
                                _focus={{ outline: 'none' }}
                                onClick={() => {
                                    onModalClose();
                                    if (modalComment.trim() !== '') {
                                        setClosingComment((prevComment) => `${prevComment}${prevComment !== '' ? '\n' : ''}${modalComment}`);
                                    }
                                    setModalComment('');
                                }}
                            >
                                Confirm
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            </Modal>
            <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Competition: {eventName}
                </Text>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Team Number: {teamNumberParam}
                </Text>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Team Name: {teamName}
                </Text>
            </Box>
            <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Weight:{' '}
                </Text>
                <NumberInput
                    onChange={(value) => setWeight(value)}
                    onBlur={(event) => handleSetWeight(event.target.value)}
                    value={weight}
                    marginLeft={'15px'}
                    min={0}
                    max={125}
                    precision={2}
                    isInvalid={submitAttempted && !markedFollowUp && weight === ''}
                    width={{ base: '85%', md: '66%', lg: '50%' }}
                >
                    <NumberInputField
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                event.target.blur();
                            }
                        }}
                        enterKeyHint='done'
                        _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                        placeholder='Weight (lbs)'
                    />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </Box>

            <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Starting Height:{' '}
                </Text>
                <NumberInput
                    onChange={(value) => setHeight(value)}
                    onBlur={(event) => handleSetHeight(event.target.value)}
                    value={height}
                    marginLeft={'15px'}
                    min={0}
                    max={52}
                    precision={2}
                    isInvalid={submitAttempted && !markedFollowUp && height === ''}
                    width={{ base: '85%', md: '66%', lg: '50%' }}
                >
                    <NumberInputField
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                event.target.blur();
                            }
                        }}
                        enterKeyHint='done'
                        _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                        placeholder='Height (in)'
                    />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
            </Box>

            <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Drive Train:{' '}
                </Text>
                <Text marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Type:
                </Text>
                <RadioGroup paddingLeft={'15px'} onChange={setDriveTrain} value={driveTrain}>
                    <Stack direction={['column', 'row']}>
                        {driveTrains.map((driveTrainItem) => (
                            <Radio w={'max-content'} isInvalid={submitAttempted && !markedFollowUp && driveTrain === ''} _focus={{ outline: 'none' }} key={driveTrainItem.id} colorScheme={'green'} value={driveTrainItem.label}>
                                {driveTrainItem.label}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
                <HStack pos={'relative'} marginTop={'20px'} marginBottom={'10px'}>
                    <Text marginLeft={'10px'} fontWeight={'600'}>
                        Motors:
                    </Text>
                    {motors.length > 0 ? (
                        !deletingMotors ? (
                            <DeleteIcon onClick={() => setDeletingMotors(true)} _hover={{ color: 'red' }} cursor={'pointer'} position={'absolute'} right={0}></DeleteIcon>
                        ) : (
                            <CloseIcon onClick={() => setDeletingMotors(false)} _hover={{ color: 'red' }} cursor={'pointer'} position={'absolute'} right={0}></CloseIcon>
                        )
                    ) : null}
                </HStack>
                <VStack>
                    {motors.map((motor) => (
                        <HStack key={motor.id} position={'relative'}>
                            <Button paddingBottom={'4px'} colorScheme={'red'} onClick={() => handleDecrementMotor(motor.label)} _focus={{ outline: 'none' }}>
                                -
                            </Button>
                            <Text
                                textColor={submitAttempted && !markedFollowUp && motor.value === 0 ? 'red' : 'black'}
                                textDecoration={deletingMotors ? '3px underline red' : 'none'}
                                onClick={(event) => {
                                    if (deletingMotors) {
                                        handleRemoveMotor(motor.label);
                                    } else {
                                        event.preventDefault();
                                    }
                                }}
                                minW={{ base: '120px', md: '150px', lg: '175px' }}
                                textAlign={'center'}
                            >
                                {motor.label}: {motor.value}
                            </Text>
                            <Button paddingBottom={'4px'} maxW={'40px'} colorScheme={'green'} onClick={() => handleIncrementMotor(motor.label)} _focus={{ outline: 'none' }}>
                                +
                            </Button>
                        </HStack>
                    ))}
                </VStack>
                <Center marginTop={motors.length > 0 ? '10px' : '0px'}>
                    <Popover isLazy flip={false} placement='bottom' isOpen={isMotorsOpen} onOpen={onMotorsOpen} onClose={onMotorsClose}>
                        <PopoverTrigger>
                            <Button size={'sm'} _focus={{ outline: 'none' }}>
                                Add Motor
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent maxWidth={'75vw'} _focus={{ outline: 'none' }}>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader color='black' fontSize='md' fontWeight='bold'>
                                Choose a motor
                            </PopoverHeader>
                            <PopoverBody maxHeight={'160px'} overflowY={'auto'}>
                                <VStack spacing={'10px'}>
                                    {motorsList
                                        .filter((motor) => !motors.some((secondMotor) => secondMotor.label === motor.label))
                                        .map((motor) => (
                                            <Button
                                                fontSize={'sm'}
                                                _focus={{ outline: 'none' }}
                                                key={motor.id}
                                                onClick={() => {
                                                    handleAddMotor(motor.label);
                                                    onMotorsClose();
                                                }}
                                            >
                                                {motor.label}
                                            </Button>
                                        ))}
                                </VStack>
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                </Center>
                <HStack pos={'relative'} marginTop={'20px'} marginBottom={'10px'}>
                    <Text marginLeft={'10px'} fontWeight={'600'}>
                        Wheels:
                    </Text>
                    {wheels.length > 0 ? (
                        !deletingWheels ? (
                            <DeleteIcon onClick={() => setDeletingWheels(true)} _hover={{ color: 'red' }} cursor={'pointer'} position={'absolute'} right={0}></DeleteIcon>
                        ) : (
                            <CloseIcon onClick={() => setDeletingWheels(false)} _hover={{ color: 'red' }} cursor={'pointer'} position={'absolute'} right={0}></CloseIcon>
                        )
                    ) : null}
                </HStack>
                <VStack>
                    {wheels.map((wheel) => (
                        <Grid key={wheel.id} templateColumns='1fr 2fr 1fr'>
                            <GridItem>
                                <Text
                                    textDecoration={deletingWheels ? '3px underline red' : 'none'}
                                    onClick={(event) => {
                                        if (deletingWheels) {
                                            handleRemoveWheel(wheel.label);
                                        } else {
                                            event.preventDefault();
                                        }
                                    }}
                                    marginTop='10px'
                                    marginBottom='10px'
                                    fontSize={{ base: '90%', md: '100%', lg: '100%' }}
                                    textAlign={'center'}
                                >
                                    {wheel.label}
                                </Text>
                            </GridItem>
                            <GridItem>
                                <Center>
                                    <NumberInput
                                        onChange={(value) => handleWheelSize(wheel.label, value)}
                                        onBlur={(event) => handleWheelSizeBlur(wheel.label, event.target.value)}
                                        value={wheel.size}
                                        min={0}
                                        max={20}
                                        precision={2}
                                        width={'75%'}
                                        isInvalid={submitAttempted && !markedFollowUp && wheel.size === ''}
                                        // fontSize={{ base: '80%', md: '100%', lg: '100%' }}
                                    >
                                        <NumberInputField
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.target.blur();
                                                }
                                            }}
                                            enterKeyHint='done'
                                            _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                                            textAlign={'center'}
                                            padding={'0px 0px 0px 0px'}
                                            fontSize={{ base: '90%', md: '100%', lg: '100%' }}
                                            placeholder='Size (in)'
                                        />
                                    </NumberInput>
                                </Center>
                            </GridItem>
                            <GridItem>
                                <HStack marginTop='10px' marginBottom='10px'>
                                    <Button paddingBottom={'2px'} size='xs' colorScheme={'red'} onClick={() => handleDecrementWheel(wheel.label)} _focus={{ outline: 'none' }}>
                                        -
                                    </Button>
                                    <Text textColor={submitAttempted && !markedFollowUp && wheel.value === 0 ? 'red' : 'black'}>{wheel.value}</Text>
                                    <Button paddingBottom={'2px'} size={'xs'} colorScheme={'green'} onClick={() => handleIncrementWheel(wheel.label)} _focus={{ outline: 'none' }}>
                                        +
                                    </Button>
                                </HStack>
                            </GridItem>
                        </Grid>
                    ))}
                </VStack>
                <Center marginTop={wheels.length > 0 ? '10px' : '0px'}>
                    <Popover isLazy flip={false} placement='bottom' isOpen={isWheelsOpen} onOpen={onWheelsOpen} onClose={onWheelsClose}>
                        <PopoverTrigger>
                            <Button size={'sm'} _focus={{ outline: 'none' }}>
                                Add Wheel
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent maxWidth={'75vw'} _focus={{ outline: 'none' }}>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader color='black' fontSize='md' fontWeight='bold'>
                                Choose a wheel
                            </PopoverHeader>
                            <PopoverBody maxHeight={'160px'} overflowY={'auto'}>
                                <VStack spacing={'10px'}>
                                    {wheelsList
                                        .filter((wheel) => !wheels.some((secondWheel) => secondWheel.label === wheel.label))
                                        .map((wheel) => (
                                            <Button
                                                fontSize={'sm'}
                                                _focus={{ outline: 'none' }}
                                                key={wheel.id}
                                                onClick={() => {
                                                    handleAddWheel(wheel.label);
                                                    onWheelsClose();
                                                }}
                                            >
                                                {wheel.label}
                                            </Button>
                                        ))}
                                </VStack>
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                </Center>
                <Center marginTop={'20px'}>
                    <Textarea
                        _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                        onChange={(event) => setDriveTrainComment(event.target.value)}
                        value={driveTrainComment}
                        placeholder='Any additional comments about drive train'
                        w={'85%'}
                    ></Textarea>
                </Center>
            </Box>
            <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Autonomous:{' '}
                </Text>
                <Text marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Programming Language:
                </Text>
                <RadioGroup marginLeft={'15px'} onChange={setProgrammingLanguage} value={programmingLanguage}>
                    <Stack direction={['column', 'row']}>
                        {programmingLanguages.map((programmingLanguageItem) => (
                            <Radio
                                w={'max-content'}
                                isInvalid={submitAttempted && !markedFollowUp && programmingLanguage === ''}
                                _focus={{ outline: 'none' }}
                                key={programmingLanguageItem.id}
                                colorScheme={'green'}
                                value={programmingLanguageItem.label}
                            >
                                {programmingLanguageItem.label}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Prefered Starting Position:
                </Text>
                <RadioGroup marginLeft={'15px'} onChange={setStartingPosition} value={startingPosition}>
                    <Stack direction={['column', 'row']}>
                        {startingPositions.map((startingPositionItem) => (
                            <Radio w={'max-content'} isInvalid={submitAttempted && !markedFollowUp && startingPosition === ''} _focus={{ outline: 'none' }} key={startingPositionItem.id} colorScheme={'green'} value={startingPositionItem.label}>
                                {startingPositionItem.label}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Taxi (Cross Tarmac):
                </Text>
                <RadioGroup marginLeft={'15px'} onChange={setTaxi} value={taxi}>
                    <Stack direction={['column', 'row']}>
                        {taxiOptions.map((taxiItem) => (
                            <Radio w={'max-content'} isInvalid={submitAttempted && !markedFollowUp && taxi === ''} _focus={{ outline: 'none' }} key={taxiItem.id} colorScheme={'green'} value={taxiItem.label}>
                                {taxiItem.label}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
                <Center marginTop={'20px'}>
                    <Textarea
                        _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                        onChange={(event) => setAutoComment(event.target.value)}
                        value={autoComment}
                        placeholder="Most effective strategy in auto? (Even if that's just taxi)"
                        w={'85%'}
                    ></Textarea>
                </Center>
            </Box>
            <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Abilities:{' '}
                </Text>
                <Text marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Intake:
                </Text>
                <VStack marginLeft={'15px'} align={'start'}>
                    {abilities.slice(0, 3).map((ability) => (
                        <Checkbox
                            //removes the blue outline on focus
                            css={`
                                > span:first-of-type {
                                    box-shadow: unset;
                                }
                            `}
                            key={ability.id}
                            colorScheme={'green'}
                            isChecked={ability.value}
                            onChange={() => handleAbilityCheck(ability.label)}
                        >
                            {ability.label}
                        </Checkbox>
                    ))}
                </VStack>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Shooting:
                </Text>
                <VStack marginLeft={'15px'} align={'start'}>
                    {abilities.slice(3, 5).map((ability) => (
                        <Checkbox
                            //removes the blue outline on focus
                            css={`
                                > span:first-of-type {
                                    box-shadow: unset;
                                }
                            `}
                            key={ability.id}
                            colorScheme={'green'}
                            isChecked={ability.value}
                            onChange={() => handleAbilityCheck(ability.label)}
                        >
                            {ability.label}
                        </Checkbox>
                    ))}
                </VStack>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Climb:
                </Text>
                <VStack marginLeft={'15px'} align={'start'}>
                    {abilities.slice(5).map((ability) => (
                        <Checkbox
                            //removes the blue outline on focus
                            css={`
                                > span:first-of-type {
                                    box-shadow: unset;
                                }
                            `}
                            key={ability.id}
                            colorScheme={'green'}
                            isChecked={ability.value}
                            onChange={() => handleAbilityCheck(ability.label)}
                        >
                            {ability.label}
                        </Checkbox>
                    ))}
                </VStack>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Holding Capacity:
                </Text>
                <RadioGroup marginLeft={'15px'} onChange={setHoldingCapacity} value={holdingCapacity}>
                    <Stack direction={['column', 'row']}>
                        {holdingCapacities.map((carryingCapacityItem) => (
                            <Radio w={'max-content'} isInvalid={submitAttempted && !markedFollowUp && holdingCapacity === ''} _focus={{ outline: 'none' }} key={carryingCapacityItem.id} colorScheme={'green'} value={carryingCapacityItem.label}>
                                {carryingCapacityItem.label}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
            </Box>
            <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'20px'}>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Closing:{' '}
                </Text>
                <Center>
                    <Textarea
                        _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                        onChange={(event) => setWorkingComment(event.target.value)}
                        value={workingComment}
                        placeholder='Anything the team is still working on?'
                        w={'85%'}
                    ></Textarea>
                </Center>
                <Center marginTop={'20px'}>
                    <Textarea _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }} onChange={(event) => setClosingComment(event.target.value)} value={closingComment} placeholder='Any additional comments' w={'85%'}></Textarea>
                </Center>
                <VStack marginTop={'20px'}>
                    {/* <img
                        style={{
                            objectFit: 'cover',
                            width: '100px',
                            height: '100px',
                        }}
                        src={image}
                    /> */}
                    <Image w={{ base: '60%', md: '35%', lg: '35%' }} maxW={{ base: '60%', md: '35%', lg: '35%' }} src={image} />
                    <input type='file' accept='image/*' style={{ display: 'none' }} ref={hiddenImageInput} onChange={(event) => updateImage(event)} />
                    <Button variant='outline' borderColor='gray.300' _focus={{ outline: 'none' }} onClick={() => hiddenImageInput.current.click()}>
                        Upload Image
                    </Button>
                </VStack>
                <Center>
                    <Checkbox
                        marginTop={'20px'}
                        //removes the blue outline on focus
                        css={`
                            > span:first-of-type {
                                box-shadow: unset;
                            }
                        `}
                        colorScheme={'green'}
                        isChecked={markedFollowUp}
                        onChange={() => setMarkedFollowUp(!markedFollowUp)}
                    >
                        Mark For Follow Up
                    </Checkbox>
                </Center>
                {markedFollowUp ? (
                    <Center marginTop={'10px'}>
                        <Textarea
                            isInvalid={markedFollowUp && submitAttempted && followUpComment.trim() === ''}
                            _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                            onChange={(event) => setFollowUpComment(event.target.value)}
                            value={followUpComment}
                            placeholder='What is the reason for the follow up?'
                            w={'85%'}
                        ></Textarea>
                    </Center>
                ) : null}
            </Box>
            <Center>
                <Button _focus={{ outline: 'none' }} marginBottom={'25px'} onClick={() => submit()}>
                    Submit
                </Button>
            </Center>
        </Box>
    );
}

export default PitForm;

function twoPrecision(value) {
    return (Math.round(value * 100) / 100).toFixed(2);
}
