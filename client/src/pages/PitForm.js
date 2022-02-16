import { React, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PITFORM } from '../graphql/queries';
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
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
} from '@chakra-ui/react';
import { year } from '../util/constants';
import { AddIcon, CloseIcon, DeleteIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';

let driveTrainsList = [
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
let programmingLanguagesList = [
    { label: 'Java', id: uuidv4() },
    { label: 'C++', id: uuidv4() },
    { label: 'LabVIEW', id: uuidv4() },
];
let startingPositionsList = [
    { label: 'Fender', id: uuidv4() },
    { label: 'Tarmac Middle', id: uuidv4() },
    { label: 'Tarmac Edge', id: uuidv4() },
];
let taxiList = [
    { label: 'Yes', id: uuidv4() },
    { label: 'No', id: uuidv4() },
];
let abilitiesList = [
    { label: 'Deliver Cargo to Terminal', id: uuidv4() },
    { label: 'Receive Cargo from Terminal', id: uuidv4() },
    { label: 'Pick up Cargo from floor', id: uuidv4() },
    { label: 'Score Cargo into the Lower Hub', id: uuidv4() },
    { label: 'Score Cargo into the Upper Hub', id: uuidv4() },
    { label: 'Hang on Low Rung', id: uuidv4() },
    { label: 'Hang on Mid Rung', id: uuidv4() },
    { label: 'Hang on High Rung', id: uuidv4() },
    { label: 'Hang on Traversal Rung', id: uuidv4() },
];
let holdingCapacitiesList = [
    { label: '0', id: uuidv4() },
    { label: '1', id: uuidv4() },
    { label: '2', id: uuidv4() },
];

function PitForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();
    let { eventKey: eventKeyParam, teamNumber: teamNumberParam } = useParams();
    const hiddenImageInput = useRef(null);
    const safeToSave = useRef(false);

    const [error, setError] = useState(null);
    const cancelRef = useRef();
    const [pitFormDialog, setPitFormDialog] = useState(false);
    const [loadResponse, setLoadResponse] = useState(null);
    const [imgHeader, setImgHeader] = useState('Same Image');
    const [teamName, setTeamName] = useState(null);
    const [eventName, setEventName] = useState(null);
    const [pitFormData, setPitFormData] = useState({
        weight: null,
        height: null,
        driveTrain: null,
        motors: [],
        wheels: [],
        driveTrainComment: '',
        programmingLanguage: null,
        startingPosition: null,
        taxi: null,
        autoComment: '',
        abilities: [],
        holdingCapacity: null,
        workingComment: '',
        closingComment: '',
        image: '',
        followUp: false,
        followUpComment: '',
        loading: true,
    });
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const [modalComment, setModalComment] = useState('');
    const { isOpen: isMotorsOpen, onOpen: onMotorsOpen, onClose: onMotorsClose } = useDisclosure();
    const [deletingMotors, setDeletingMotors] = useState(false);
    const { isOpen: isWheelsOpen, onOpen: onWheelsOpen, onClose: onWheelsClose } = useDisclosure();
    const [deletingWheels, setDeletingWheels] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('PitFormData')) {
            let pitForm = JSON.parse(localStorage.getItem('PitFormData'));
            if (pitForm.teamNumberParam === teamNumberParam && pitForm.eventKeyParam === eventKeyParam) {
                setLoadResponse('Required');
                setPitFormDialog(true);
            } else {
                setLoadResponse(false);
            }
        } else {
            setLoadResponse(false);
        }
    }, [eventKeyParam, teamNumberParam]);

    useEffect(() => {
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
                        setError('This team is not competing at this event or this event does not exist');
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
    }, [eventKeyParam, teamNumberParam]);

    function handleSetWeight(value) {
        if (value.trim() !== '') {
            setPitFormData({ ...pitFormData, weight: twoPrecision(parseFloat(value)) });
        } else if (value.trim() === '') {
            setPitFormData({ ...pitFormData, weight: null });
        }
    }

    function handleSetHeight(value) {
        if (value.trim() !== '') {
            setPitFormData({ ...pitFormData, height: twoPrecision(parseFloat(value)) });
        } else if (value.trim() === '') {
            setPitFormData({ ...pitFormData, height: null });
        }
    }

    function handleAddMotor(motorName) {
        let newMotors = [
            ...pitFormData.motors,
            {
                label: motorName,
                value: 0,
                id: uuidv4(),
            },
        ];
        setPitFormData({
            ...pitFormData,
            motors: newMotors,
        });
    }

    function handleRemoveMotor(motorName) {
        let newMotors = [...pitFormData.motors].filter((motor) => motor.label !== motorName);
        setPitFormData({
            ...pitFormData,
            motors: newMotors,
        });
        if (newMotors.length === 0) {
            setDeletingMotors(false);
        }
    }

    function handleDecrementMotor(motorLabel) {
        let newMotors = pitFormData.motors.map((motor) => {
            if (motorLabel === motor.label) {
                return {
                    ...motor,
                    value: motor.value === 0 ? 0 : motor.value - 1,
                };
            } else {
                return motor;
            }
        });
        setPitFormData({
            ...pitFormData,
            motors: newMotors,
        });
    }

    function handleIncrementMotor(motorLabel) {
        let newMotors = pitFormData.motors.map((motor) => {
            if (motorLabel === motor.label) {
                return {
                    ...motor,
                    value: motor.value + 1,
                };
            } else {
                return motor;
            }
        });
        setPitFormData({
            ...pitFormData,
            motors: newMotors,
        });
    }

    function handleAddWheel(wheelName) {
        let newWheels = [
            ...pitFormData.wheels,
            {
                label: wheelName,
                size: '',
                value: 0,
                id: uuidv4(),
            },
        ];
        setPitFormData({
            ...pitFormData,
            wheels: newWheels,
        });
    }

    function handleRemoveWheel(wheelName) {
        let newWheels = [...pitFormData.wheels].filter((wheel) => wheel.label !== wheelName);
        setPitFormData({
            ...pitFormData,
            wheels: newWheels,
        });
        if (newWheels.length === 0) {
            setDeletingWheels(false);
        }
    }

    function handleDecrementWheel(wheelLabel) {
        let newWheels = pitFormData.wheels.map((wheel) => {
            if (wheelLabel === wheel.label) {
                return {
                    ...wheel,
                    value: wheel.value === 0 ? 0 : wheel.value - 1,
                };
            } else {
                return wheel;
            }
        });
        setPitFormData({
            ...pitFormData,
            wheels: newWheels,
        });
    }

    function handleIncrementWheel(wheelLabel) {
        let newWheels = pitFormData.wheels.map((wheel) => {
            if (wheelLabel === wheel.label) {
                return {
                    ...wheel,
                    value: wheel.value + 1,
                };
            } else {
                return wheel;
            }
        });
        setPitFormData({
            ...pitFormData,
            wheels: newWheels,
        });
    }

    function handleWheelSize(wheelLabel, wheelSize) {
        let newWheels = pitFormData.wheels.map((wheel) => {
            if (wheelLabel === wheel.label) {
                return {
                    ...wheel,
                    size: wheelSize,
                };
            } else {
                return wheel;
            }
        });
        setPitFormData({
            ...pitFormData,
            wheels: newWheels,
        });
    }

    function handleWheelSizeBlur(wheelLabel, wheelSize) {
        let newWheels = pitFormData.wheels.map((wheel) => {
            if (wheelLabel === wheel.label && wheelSize.trim() !== '') {
                return {
                    ...wheel,
                    size: twoPrecision(parseFloat(wheelSize)),
                };
            } else {
                return wheel;
            }
        });
        setPitFormData({
            ...pitFormData,
            wheels: newWheels,
        });
    }

    function handleAddAbility(abilityLabel) {
        if (pitFormData.abilities.includes(abilityLabel)) {
            setPitFormData({
                ...pitFormData,
                abilities: [...pitFormData.abilities].filter((ability) => ability !== abilityLabel),
            });
        } else {
            setPitFormData({
                ...pitFormData,
                abilities: [...pitFormData.abilities, abilityLabel],
            });
        }
    }

    function updateImage(event) {
        if (event.target.files && event.target.files[0] && event.target.files[0].type.split('/')[0] === 'image') {
            var FR = new FileReader();
            FR.readAsDataURL(event.target.files[0]);
            FR.onload = () => {
                setImgHeader('New Image');
                setPitFormData({ ...pitFormData, image: FR.result });
            };
        }
    }

    useEffect(() => {
        if (safeToSave.current) {
            localStorage.setItem('PitFormData', JSON.stringify({ ...pitFormData, eventKeyParam, teamNumberParam }));
        } else if (!pitFormData.loading) {
            safeToSave.current = true;
        }
    }, [pitFormData, eventKeyParam, teamNumberParam]);

    function validMotors() {
        for (const motor of pitFormData.motors) {
            if (motor.value === 0) {
                return false;
            }
        }
        return true;
    }

    function validWheels() {
        for (const wheel of pitFormData.wheels) {
            if (wheel.value === 0 || wheel.size === '') {
                return false;
            }
        }
        return true;
    }

    function validForm() {
        return (
            pitFormData.weight !== null &&
            pitFormData.height !== null &&
            pitFormData.driveTrain !== null &&
            validMotors() &&
            validWheels() &&
            pitFormData.programmingLanguage !== null &&
            pitFormData.startingPosition !== null &&
            pitFormData.taxi !== null &&
            pitFormData.holdingCapacity !== null
        );
    }

    const { loading: loadingPitForm, error: pitFormError } = useQuery(GET_PITFORM, {
        skip: !eventName || loadResponse === null || loadResponse,
        fetchPolicy: 'network-only',
        variables: {
            eventKey: eventKeyParam,
            teamNumber: parseInt(teamNumberParam),
        },
        onError(err) {
            if (err.message === 'Error: Pit form does not exist') {
                setError(false);
                setPitFormData({ ...pitFormData, loading: false });
            } else {
                console.log(JSON.stringify(err, null, 2));
                setError('Apollo error, could not retrieve pit form');
            }
        },
        onCompleted({ getPitForm: pitForm }) {
            let modifiedMotors = pitForm.motors.map((motor) => {
                return {
                    label: motor.label,
                    value: motor.value,
                    id: uuidv4(),
                };
            });
            let modifiedWheels = pitForm.wheels.map((wheel) => {
                return {
                    label: wheel.label,
                    size: wheel.size === null ? '' : wheel.size.toString(),
                    value: wheel.value,
                    id: uuidv4(),
                };
            });
            setPitFormData({
                weight: pitForm.weight,
                height: pitForm.height,
                driveTrain: pitForm.driveTrain,
                motors: modifiedMotors,
                wheels: modifiedWheels,
                driveTrainComment: pitForm.driveTrainComment,
                programmingLanguage: pitForm.programmingLanguage,
                startingPosition: pitForm.startingPosition,
                taxi: pitForm.taxi,
                autoComment: pitForm.autoComment,
                abilities: pitForm.abilities,
                holdingCapacity: pitForm.holdingCapacity,
                workingComment: pitForm.workingComment,
                closingComment: pitForm.workingComment,
                image: pitForm.image,
                followUp: pitForm.followUp,
                followUpComment: pitForm.followUpComment,
                loading: false,
            });
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
            if (location.state && location.state.previousRoute && location.state.previousRoute === 'pits') {
                navigate('/pits');
            } else {
                navigate('/');
            }
            localStorage.removeItem('PitFormData');
        },
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            toast({
                title: 'Apollo Error',
                description: 'Pit form could not be updated',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        },
    });

    function submit() {
        setSubmitAttempted(true);
        if (!validForm() && !pitFormData.followUp) {
            toast({
                title: 'Missing fields',
                description: 'Fill out all fields, otherwise mark for follow up',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        } else if (pitFormData.followUp && pitFormData.followUpComment.trim() === '') {
            toast({
                title: 'Missing fields',
                description: 'Leave a follow up comment',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        let modifiedMotors = pitFormData.motors.map((motor) => {
            return { label: motor.label, value: motor.value };
        });
        let modifiedWheels = pitFormData.wheels.map((wheel) => {
            return {
                label: wheel.label,
                size: parseFloat(wheel.size),
                value: wheel.value,
            };
        });
        updatePitForm({
            variables: {
                pitFormInput: {
                    eventKey: eventKeyParam,
                    eventName: eventName,
                    teamNumber: parseInt(teamNumberParam),
                    teamName: teamName,
                    weight: parseFloat(pitFormData.weight),
                    height: parseFloat(pitFormData.height),
                    driveTrain: pitFormData.driveTrain,
                    motors: modifiedMotors,
                    wheels: modifiedWheels,
                    driveTrainComment: pitFormData.driveTrainComment.trim(),
                    programmingLanguage: pitFormData.programmingLanguage,
                    startingPosition: pitFormData.startingPosition,
                    taxi: pitFormData.taxi,
                    autoComment: pitFormData.autoComment.trim(),
                    abilities: pitFormData.abilities,
                    holdingCapacity: parseInt(pitFormData.holdingCapacity),
                    workingComment: pitFormData.workingComment.trim(),
                    closingComment: pitFormData.closingComment.trim(),
                    image: pitFormData.image,
                    followUp: pitFormData.followUp,
                    followUpComment: pitFormData.followUp ? pitFormData.followUpComment.trim() : '',
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

    if (loadResponse === 'Required') {
        return (
            <AlertDialog
                closeOnEsc={false}
                closeOnOverlayClick={false}
                isOpen={pitFormDialog}
                leastDestructiveRef={cancelRef}
                onClose={() => {
                    setPitFormDialog(false);
                }}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent margin={0} w={{ base: '75%', md: '40%', lg: '30%' }} top='25%'>
                        <AlertDialogHeader color='black' fontSize='lg' fontWeight='bold'>
                            Unsaved Data
                        </AlertDialogHeader>
                        <AlertDialogBody>You have unsaved data for this pit form. Would you like to load it, delete it, or pull data from the cloud?</AlertDialogBody>
                        <AlertDialogFooter>
                            <Button
                                onClick={() => {
                                    setPitFormDialog(false);
                                    setLoadResponse(false);
                                    localStorage.removeItem('PitFormData');
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
                                    setPitFormDialog(false);
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
                                    setPitFormDialog(false);
                                    setLoadResponse(true);
                                    let pitForm = JSON.parse(localStorage.getItem('PitFormData'));
                                    setPitFormData({
                                        weight: pitForm.weight,
                                        height: pitForm.height,
                                        driveTrain: pitForm.driveTrain,
                                        motors: pitForm.motors,
                                        wheels: pitForm.wheels,
                                        driveTrainComment: pitForm.driveTrainComment,
                                        programmingLanguage: pitForm.programmingLanguage,
                                        startingPosition: pitForm.startingPosition,
                                        taxi: pitForm.taxi,
                                        autoComment: pitForm.autoComment,
                                        abilities: pitForm.abilities,
                                        holdingCapacity: pitForm.holdingCapacity,
                                        workingComment: pitForm.workingComment,
                                        closingComment: pitForm.workingComment,
                                        image: pitForm.image,
                                        followUp: pitForm.followUp,
                                        followUpComment: pitForm.followUpComment,
                                        loading: false,
                                    });
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

    if (loadingPitForm || (pitFormError && error !== false) || pitFormData.loading || eventName === null || teamName === null) {
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
                            <Textarea
                                _focus={{
                                    outline: 'none',
                                    boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px',
                                }}
                                onChange={(event) => setModalComment(event.target.value)}
                                value={modalComment}
                                placeholder='Comment...'
                            />
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
                                        setPitFormData({ ...pitFormData, closingComment: `${pitFormData.closingComment}${pitFormData.closingComment !== '' ? '\n' : ''}${modalComment}` });
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
                    Weight:
                </Text>
                <NumberInput
                    onChange={(value) => setPitFormData({ ...pitFormData, weight: value })}
                    onBlur={(event) => handleSetWeight(event.target.value)}
                    value={pitFormData.weight || ''}
                    marginLeft={'15px'}
                    min={0}
                    max={125}
                    precision={2}
                    isInvalid={submitAttempted && !pitFormData.followUp && pitFormData.weight === null}
                    width={{ base: '85%', md: '66%', lg: '50%' }}
                >
                    <NumberInputField
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                event.target.blur();
                            }
                        }}
                        enterKeyHint='done'
                        _focus={{
                            outline: 'none',
                            boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px',
                        }}
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
                    Starting Height:
                </Text>
                <NumberInput
                    onChange={(value) => setPitFormData({ ...pitFormData, height: value })}
                    onBlur={(event) => handleSetHeight(event.target.value)}
                    value={pitFormData.height || ''}
                    marginLeft={'15px'}
                    min={0}
                    max={52}
                    precision={2}
                    isInvalid={submitAttempted && !pitFormData.followUp && pitFormData.height === null}
                    width={{ base: '85%', md: '66%', lg: '50%' }}
                >
                    <NumberInputField
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                event.target.blur();
                            }
                        }}
                        enterKeyHint='done'
                        _focus={{
                            outline: 'none',
                            boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px',
                        }}
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
                    Drive Train:
                </Text>
                <Text marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Type:
                </Text>
                <RadioGroup paddingLeft={'15px'} onChange={(value) => setPitFormData({ ...pitFormData, driveTrain: value })} value={pitFormData.driveTrain}>
                    <Stack direction={['column', 'row']}>
                        {driveTrainsList.map((driveTrain) => (
                            <Radio w={'max-content'} isInvalid={submitAttempted && !pitFormData.followUp && pitFormData.driveTrain === null} _focus={{ outline: 'none' }} key={driveTrain.id} colorScheme={'green'} value={driveTrain.label}>
                                {driveTrain.label}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
                <HStack pos={'relative'} marginTop={'20px'} marginBottom={'10px'}>
                    <Text marginLeft={'10px'} fontWeight={'600'}>
                        Motors:
                    </Text>
                    {pitFormData.motors.length > 0 ? (
                        !deletingMotors ? (
                            <DeleteIcon onClick={() => setDeletingMotors(true)} _hover={{ color: 'red' }} cursor={'pointer'} position={'absolute'} right={0}></DeleteIcon>
                        ) : (
                            <CloseIcon onClick={() => setDeletingMotors(false)} _hover={{ color: 'red' }} cursor={'pointer'} position={'absolute'} right={0}></CloseIcon>
                        )
                    ) : null}
                </HStack>
                <VStack>
                    {pitFormData.motors.map((motor) => (
                        <HStack key={motor.id} position={'relative'}>
                            <Button paddingBottom={'4px'} colorScheme={'red'} onClick={() => handleDecrementMotor(motor.label)} _focus={{ outline: 'none' }}>
                                -
                            </Button>
                            <Text
                                textColor={submitAttempted && !pitFormData.followUp && motor.value === 0 ? 'red' : 'black'}
                                textDecoration={deletingMotors ? '3px underline red' : 'none'}
                                onClick={(event) => {
                                    if (deletingMotors) {
                                        handleRemoveMotor(motor.label);
                                    } else {
                                        event.preventDefault();
                                    }
                                }}
                                minW={{
                                    base: '120px',
                                    md: '150px',
                                    lg: '175px',
                                }}
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
                <Center marginTop={pitFormData.motors.length > 0 ? '10px' : '0px'}>
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
                                        .filter((motor) => !pitFormData.motors.some((secondMotor) => secondMotor.label === motor.label))
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
                    {pitFormData.wheels.length > 0 ? (
                        !deletingWheels ? (
                            <DeleteIcon onClick={() => setDeletingWheels(true)} _hover={{ color: 'red' }} cursor={'pointer'} position={'absolute'} right={0}></DeleteIcon>
                        ) : (
                            <CloseIcon onClick={() => setDeletingWheels(false)} _hover={{ color: 'red' }} cursor={'pointer'} position={'absolute'} right={0}></CloseIcon>
                        )
                    ) : null}
                </HStack>
                <VStack>
                    {pitFormData.wheels.map((wheel) => (
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
                                    fontSize={{
                                        base: '90%',
                                        md: '100%',
                                        lg: '100%',
                                    }}
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
                                        isInvalid={submitAttempted && !pitFormData.followUp && wheel.size === ''}
                                        // fontSize={{ base: '80%', md: '100%', lg: '100%' }}
                                    >
                                        <NumberInputField
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.target.blur();
                                                }
                                            }}
                                            enterKeyHint='done'
                                            _focus={{
                                                outline: 'none',
                                                boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px',
                                            }}
                                            textAlign={'center'}
                                            padding={'0px 0px 0px 0px'}
                                            fontSize={{
                                                base: '90%',
                                                md: '100%',
                                                lg: '100%',
                                            }}
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
                                    <Text textColor={submitAttempted && !pitFormData.followUp && wheel.value === 0 ? 'red' : 'black'}>{wheel.value}</Text>
                                    <Button paddingBottom={'2px'} size={'xs'} colorScheme={'green'} onClick={() => handleIncrementWheel(wheel.label)} _focus={{ outline: 'none' }}>
                                        +
                                    </Button>
                                </HStack>
                            </GridItem>
                        </Grid>
                    ))}
                </VStack>
                <Center marginTop={pitFormData.wheels.length > 0 ? '10px' : '0px'}>
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
                                        .filter((wheel) => !pitFormData.wheels.some((secondWheel) => secondWheel.label === wheel.label))
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
                        _focus={{
                            outline: 'none',
                            boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px',
                        }}
                        onChange={(event) => setPitFormData({ ...pitFormData, driveTrainComment: event.target.value })}
                        value={pitFormData.driveTrainComment}
                        placeholder='Any additional comments about drive train'
                        w={'85%'}
                    ></Textarea>
                </Center>
            </Box>
            <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Autonomous:
                </Text>
                <Text marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Programming Language:
                </Text>
                <RadioGroup marginLeft={'15px'} onChange={(value) => setPitFormData({ ...pitFormData, programmingLanguage: value })} value={pitFormData.programmingLanguage}>
                    <Stack direction={['column', 'row']}>
                        {programmingLanguagesList.map((programmingLanguage) => (
                            <Radio
                                w={'max-content'}
                                isInvalid={submitAttempted && !pitFormData.followUp && pitFormData.programmingLanguage === null}
                                _focus={{ outline: 'none' }}
                                key={programmingLanguage.id}
                                colorScheme={'green'}
                                value={programmingLanguage.label}
                            >
                                {programmingLanguage.label}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Prefered Starting Position:
                </Text>
                <RadioGroup marginLeft={'15px'} onChange={(value) => setPitFormData({ ...pitFormData, startingPosition: value })} value={pitFormData.startingPosition}>
                    <Stack direction={['column', 'row']}>
                        {startingPositionsList.map((startingPosition) => (
                            <Radio
                                w={'max-content'}
                                isInvalid={submitAttempted && !pitFormData.followUp && pitFormData.startingPosition === null}
                                _focus={{ outline: 'none' }}
                                key={startingPosition.id}
                                colorScheme={'green'}
                                value={startingPosition.label}
                            >
                                {startingPosition.label}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Taxi (Cross Tarmac):
                </Text>
                <RadioGroup marginLeft={'15px'} onChange={(value) => setPitFormData({ ...pitFormData, taxi: value })} value={pitFormData.taxi}>
                    <Stack direction={['column', 'row']}>
                        {taxiList.map((taxi) => (
                            <Radio w={'max-content'} isInvalid={submitAttempted && !pitFormData.followUp && pitFormData.taxi === null} _focus={{ outline: 'none' }} key={taxi.id} colorScheme={'green'} value={taxi.label}>
                                {taxi.label}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
                <Center marginTop={'20px'}>
                    <Textarea
                        _focus={{
                            outline: 'none',
                            boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px',
                        }}
                        onChange={(event) => setPitFormData({ ...pitFormData, autoComment: event.target.value })}
                        value={pitFormData.autoComment}
                        placeholder="Most effective strategy in auto? (Even if that's just taxi)"
                        w={'85%'}
                    ></Textarea>
                </Center>
            </Box>
            <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Abilities:
                </Text>
                <Text marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Intake:
                </Text>
                <VStack marginLeft={'15px'} align={'start'}>
                    {abilitiesList.slice(0, 3).map((ability) => (
                        <Checkbox
                            //removes the blue outline on focus
                            css={`
                                > span:first-of-type {
                                    box-shadow: unset;
                                }
                            `}
                            key={ability.id}
                            colorScheme={'green'}
                            isChecked={pitFormData.abilities.includes(ability.label)}
                            onChange={() => handleAddAbility(ability.label)}
                        >
                            {ability.label}
                        </Checkbox>
                    ))}
                </VStack>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Shooting:
                </Text>
                <VStack marginLeft={'15px'} align={'start'}>
                    {abilitiesList.slice(3, 5).map((ability) => (
                        <Checkbox
                            //removes the blue outline on focus
                            css={`
                                > span:first-of-type {
                                    box-shadow: unset;
                                }
                            `}
                            key={ability.id}
                            colorScheme={'green'}
                            isChecked={pitFormData.abilities.includes(ability.label)}
                            onChange={() => handleAddAbility(ability.label)}
                        >
                            {ability.label}
                        </Checkbox>
                    ))}
                </VStack>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Climb:
                </Text>
                <VStack marginLeft={'15px'} align={'start'}>
                    {abilitiesList.slice(5).map((ability) => (
                        <Checkbox
                            //removes the blue outline on focus
                            css={`
                                > span:first-of-type {
                                    box-shadow: unset;
                                }
                            `}
                            key={ability.id}
                            colorScheme={'green'}
                            isChecked={pitFormData.abilities.includes(ability.label)}
                            onChange={() => handleAddAbility(ability.label)}
                        >
                            {ability.label}
                        </Checkbox>
                    ))}
                </VStack>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Cargo Capacity:
                </Text>
                <RadioGroup marginLeft={'15px'} onChange={(value) => setPitFormData({ ...pitFormData, holdingCapacity: value })} value={pitFormData.holdingCapacity}>
                    <Stack direction={['column', 'row']}>
                        {holdingCapacitiesList.map((holdingCapacity) => (
                            <Radio
                                w={'max-content'}
                                isInvalid={submitAttempted && !pitFormData.followUp && pitFormData.holdingCapacity === null}
                                _focus={{ outline: 'none' }}
                                key={holdingCapacity.id}
                                colorScheme={'green'}
                                value={holdingCapacity.label}
                            >
                                {holdingCapacity.label}
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
                        _focus={{
                            outline: 'none',
                            boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px',
                        }}
                        onChange={(event) => setPitFormData({ ...pitFormData, workingComment: event.target.value })}
                        value={pitFormData.workingComment}
                        placeholder='Anything the team is still working on?'
                        w={'85%'}
                    ></Textarea>
                </Center>
                <Center marginTop={'20px'}>
                    <Textarea
                        _focus={{
                            outline: 'none',
                            boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px',
                        }}
                        onChange={(event) => setPitFormData({ ...pitFormData, closingComment: event.target.value })}
                        value={pitFormData.closingComment}
                        placeholder='Any additional comments'
                        w={'85%'}
                    ></Textarea>
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
                    <Image w={{ base: '60%', md: '35%', lg: '35%' }} maxW={{ base: '60%', md: '35%', lg: '35%' }} src={pitFormData.image} />
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
                        isChecked={pitFormData.followUp}
                        onChange={() => setPitFormData({ ...pitFormData, followUp: !pitFormData.followUp })}
                    >
                        Mark For Follow Up
                    </Checkbox>
                </Center>
                {pitFormData.followUp ? (
                    <Center marginTop={'10px'}>
                        <Textarea
                            isInvalid={pitFormData.followUp && submitAttempted && pitFormData.followUpComment.trim() === ''}
                            _focus={{
                                outline: 'none',
                                boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px',
                            }}
                            onChange={(event) => setPitFormData({ ...pitFormData, followUpComment: event.target.value })}
                            value={pitFormData.followUpComment}
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
