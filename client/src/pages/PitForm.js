import { React, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    Image,
    Spinner,
} from '@chakra-ui/react';

let driveTrains = ['Tank', 'Swerve', 'Mecanum', 'H-Drive'];
let programmingLanguages = ['Java', 'C++', 'LabView'];
let startingPositions = ['Left', 'Center', 'Right'];

function PitForm() {
    let navigate = useNavigate();
    let { eventKey, teamNumber } = useParams();
    const hiddenImageInput = useRef(null);

    const [error, setError] = useState(false);
    const [imgHeader, setImgHeader] = useState('Same Image');
    const [dataLoaded, setDataLoaded] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [eventName, setEventName] = useState('');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [driveTrain, setDriveTrain] = useState('');
    const [motors, setMotors] = useState([
        { label: 'Falcon 500', value: 0 },
        { label: 'NEO', value: 0 },
        { label: 'CIM', value: 0 },
        { label: 'Mini-CIM', value: 0 },
    ]);
    const [wheels, setWheels] = useState([
        { label: 'Traction', size: '', value: 0 },
        { label: 'Omni', size: '', value: 0 },
        { label: 'Colson', size: '', value: 0 },
        { label: 'Pneumatic', size: '', value: 0 },
        { label: 'Mecanum', size: '', value: 0 },
    ]);
    const [driveTrainComment, setDriveTrainComment] = useState('');
    const [programmingLanguage, setProgrammingLanguage] = useState('');
    const [startingPosition, setStartingPosition] = useState('');
    const [autoComment, setAutoComment] = useState('');
    const [abilities, setAbilities] = useState([
        { label: 'Deliver Cargo to Terminal', value: false },
        { label: 'Receive Cargo from Terminal', value: false },
        { label: 'Pick up Cargo from floor', value: false },
        { label: 'Score Cargo into the Lower Hub', value: false },
        { label: 'Score Cargo into the Upper Hub', value: false },
        { label: 'Hang on Low Rung', value: false },
        { label: 'Hang on Mid Rung', value: false },
        { label: 'Hang on High Rung', value: false },
        { label: 'Hang on Traversal Rung', value: false },
        { label: 'None', value: false },
    ]);
    const [workingComment, setWorkingComment] = useState('');
    const [closingComment, setClosingComment] = useState('');
    const [image, setImage] = useState('');
    const [markedFollowUp, setMarkedFollowUp] = useState(false);
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
            let tempImg = event.target.files[0];
            let fr = new FileReader();
            fr.readAsDataURL(tempImg);
            fr.onload = () => {
                tempImg = fr.result;
                setImgHeader('New Image');
                setImage(tempImg);
            };
        }
    }

    function validWheels() {
        for (const wheel of wheels) {
            if (wheel.value > 0 && wheel.size === '') {
                return false;
            }
        }
        return true;
    }

    function validForm() {
        return weight !== '' && height !== '' && driveTrain !== '' && validWheels() && programmingLanguage !== '' && startingPosition !== '' && abilities.filter((ability) => ability.value).length !== 0;
    }

    const { loading: loadingPitForm } = useQuery(GET_PITFORM, {
        fetchPolicy: 'network-only',
        variables: {
            eventKey: eventKey,
            teamNumber: parseInt(teamNumber),
        },
        onError(err) {
            if (err.message === 'Error: Pit form does not exist') {
                fetch(`/blueAlliance/team/frc${parseInt(teamNumber)}/simple`)
                    .then((response) => response.json())
                    .then((data) => {
                        if (!data.Error) {
                            setTeamName(data.nickname);
                        } else {
                            console.error('Error:', data.Error);
                            setError(true);
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        setError(true);
                    });
                fetch(`/blueAlliance/team/frc${parseInt(teamNumber)}/events/2022/simple`)
                    .then((response) => response.json())
                    .then((data) => {
                        if (!data.Error) {
                            let event = data.find((event) => event.key === eventKey);
                            if (event === undefined) {
                                setError(true);
                            } else {
                                setEventName(event.name);
                            }
                        } else {
                            console.error('Error:', data.Error);
                            setError(true);
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        setError(true);
                    });
            } else {
                console.log(JSON.stringify(err, null, 2));
                setError(true);
            }
        },
        onCompleted({ getPitForm: pitForm }) {
            setTeamName(pitForm.teamName);
            setEventName(pitForm.eventName);
            setWeight(pitForm.weight || '');
            setHeight(pitForm.height || '');
            setDriveTrain(pitForm.driveTrain);
            setMotors(pitForm.motors);
            let modifiedWheels = pitForm.wheels.map((wheel) => {
                return { label: wheel.label, size: wheel.size === null ? '' : wheel.size.toString(), value: wheel.value };
            });
            setWheels(modifiedWheels);
            setDriveTrainComment(pitForm.driveTrainComment);
            setProgrammingLanguage(pitForm.programmingLanguage);
            setStartingPosition(pitForm.startingPosition);
            setAutoComment(pitForm.autoComment);
            setAbilities(pitForm.abilities);
            setWorkingComment(pitForm.workingComment);
            setClosingComment(pitForm.closingComment);
            setImage(pitForm.image);
            setMarkedFollowUp(pitForm.followUp);
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
            navigate('/pits');
        },
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
        },
    });

    function submit() {
        setSubmitAttempted(true);
        if (!validForm() && !markedFollowUp) {
            return;
        }
        let modifiedWheels = wheels.map((wheel) => {
            return { label: wheel.label, size: parseFloat(wheel.size), value: wheel.value };
        });
        updatePitForm({
            variables: {
                pitFormInput: {
                    eventKey: eventKey,
                    eventName: eventName,
                    teamNumber: parseInt(teamNumber),
                    teamName: teamName,
                    weight: parseFloat(weight),
                    height: parseFloat(height),
                    driveTrain: driveTrain,
                    motors: motors,
                    wheels: modifiedWheels,
                    driveTrainComment: driveTrainComment,
                    programmingLanguage: programmingLanguage,
                    startingPosition: startingPosition,
                    autoComment: autoComment,
                    abilities: abilities,
                    workingComment: workingComment,
                    closingComment: closingComment,
                    image: image,
                    followUp: markedFollowUp,
                },
            },
        });
    }

    if (error) {
        return <Center>Error occurred</Center>;
    }

    if (loadingPitForm || (!dataLoaded ? eventName === '' || teamName === '' : false)) {
        return (
            <Center>
                <Spinner></Spinner>
            </Center>
        );
    }

    return (
        <Box margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
            <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Competition: {eventName}
                </Text>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Team Number: {teamNumber}
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
                    <NumberInputField _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }} placeholder='Weight (lbs)' />
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
                    <NumberInputField _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }} placeholder='Height (in)' />
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
                        {driveTrains.map((driveTrainLabel, index) => (
                            <Radio isInvalid={submitAttempted && !markedFollowUp && driveTrain === ''} _focus={{ outline: 'none' }} key={index} colorScheme={'green'} value={driveTrainLabel}>
                                {driveTrainLabel}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Motors:
                </Text>
                <Center>
                    <VStack>
                        {motors.map((motor, index) => (
                            <HStack key={index}>
                                <Button paddingBottom={'4px'} colorScheme={'red'} onClick={() => handleDecrementMotor(motor.label)} _focus={{ outline: 'none' }}>
                                    -
                                </Button>
                                <Text minW={{ base: '130px', md: '200px', lg: '300px' }} textAlign={'center'}>
                                    {motor.label}: {motor.value}
                                </Text>
                                <Button paddingBottom={'4px'} maxW={'40px'} colorScheme={'green'} onClick={() => handleIncrementMotor(motor.label)} _focus={{ outline: 'none' }}>
                                    +
                                </Button>
                            </HStack>
                        ))}
                    </VStack>
                </Center>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Wheels:
                </Text>
                <VStack>
                    {wheels.map((wheel, index) => (
                        <Grid key={index} templateColumns='1fr 2fr 1fr'>
                            <GridItem>
                                <Text marginTop='10px' marginBottom='10px' fontSize={{ base: '90%', md: '100%', lg: '100%' }} textAlign={'center'}>
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
                                        isInvalid={submitAttempted && !markedFollowUp && wheel.value > 0 && wheel.size === ''}
                                        // fontSize={{ base: '80%', md: '100%', lg: '100%' }}
                                    >
                                        <NumberInputField
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
                                    <Text>{wheel.value}</Text>
                                    <Button paddingBottom={'2px'} size={'xs'} colorScheme={'green'} onClick={() => handleIncrementWheel(wheel.label)} _focus={{ outline: 'none' }}>
                                        +
                                    </Button>
                                </HStack>
                            </GridItem>
                        </Grid>
                    ))}
                </VStack>
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
                        {programmingLanguages.map((programmingLanguageLabel, index) => (
                            <Radio isInvalid={submitAttempted && !markedFollowUp && programmingLanguage === ''} _focus={{ outline: 'none' }} key={index} colorScheme={'green'} value={programmingLanguageLabel}>
                                {programmingLanguageLabel}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
                <Text marginTop={'20px'} marginBottom={'10px'} marginLeft={'10px'} fontWeight={'600'}>
                    Prefered Starting Position:
                </Text>
                <RadioGroup marginLeft={'15px'} onChange={setStartingPosition} value={startingPosition}>
                    <Stack direction={['column', 'row']}>
                        {startingPositions.map((startingPositionLabel, index) => (
                            <Radio isInvalid={submitAttempted && !markedFollowUp && startingPosition === ''} _focus={{ outline: 'none' }} key={index} colorScheme={'green'} value={startingPositionLabel}>
                                {startingPositionLabel}
                            </Radio>
                        ))}
                    </Stack>
                </RadioGroup>
                <Center marginTop={'20px'}>
                    <Textarea
                        _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                        onChange={(event) => setAutoComment(event.target.value)}
                        value={autoComment}
                        placeholder='What is their usual strategy in auto?'
                        w={'85%'}
                    ></Textarea>
                </Center>
            </Box>
            <Box border={'black solid'} borderRadius={'10px'} padding={'10px'} marginBottom={'30px'}>
                <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                    Abilities:{' '}
                </Text>
                <VStack marginLeft={'15px'} align={'start'}>
                    {abilities.map((ability, index) => (
                        <Checkbox
                            isInvalid={submitAttempted && !markedFollowUp && abilities.filter((ability) => ability.value).length === 0}
                            //removes the blue outline on focus
                            css={`
                                > span:first-of-type {
                                    box-shadow: unset;
                                }
                            `}
                            key={index}
                            colorScheme={'green'}
                            isChecked={ability.value}
                            onChange={(event) => handleAbilityCheck(ability.label)}
                        >
                            {ability.label}
                        </Checkbox>
                    ))}
                </VStack>
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
                    <Image w={{ base: '60%', md: '35%', lg: '25%' }} maxW={{ base: '60%', md: '35%', lg: '25%' }} src={image} />
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
                        onChange={(event) => setMarkedFollowUp(!markedFollowUp)}
                    >
                        Mark For Follow Up
                    </Checkbox>
                </Center>
            </Box>

            <Center>
                <Button _focus={{ outline: 'none' }} marginBottom={'20px'} onClick={() => submit()}>
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
