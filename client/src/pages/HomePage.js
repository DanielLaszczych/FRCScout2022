import { React, useContext, useRef, useState } from 'react';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Center, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth';
import { config, year } from '../util/constants';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_EVENT } from '../graphql/queries';

function HomePage() {
    let navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const cancelRef = useRef();
    const inputElement = useRef();

    const [error, setError] = useState(null);
    const [pitFormDialog, setPitFormDialog] = useState(false);
    const [pitTeamNumber, setPitTeamNumber] = useState('');
    const [pitPopoverError, setPitPopoverError] = useState(null);
    const [fetchingConfirmation, setFetchingConfirmation] = useState(false);

    const {
        loading: loadingCurrentEvent,
        error: currentEventError,
        data: { getCurrentEvent: currentEvent } = {},
    } = useQuery(GET_CURRENT_EVENT, {
        fetchPolicy: 'network-only',
        skip: user === 'NoUser',
        onError(err) {
            if (err.message === 'Error: There is no current event') {
                setError('There is no event to scout 😔');
            } else {
                console.log(JSON.stringify(err, null, 2));
                setError('Apollo error, could not retrieve current event data');
            }
        },
    });

    function handlePitFormConfirm() {
        setFetchingConfirmation(true);
        fetch(`/blueAlliance/team/frc${parseInt(pitTeamNumber)}/events/${year}/simple`)
            .then((response) => response.json())
            .then((data) => {
                if (!data.Error) {
                    let event = data.find((event) => event.key === currentEvent.key);
                    if (event === undefined) {
                        setPitPopoverError('This team is not competing at this event');
                        setFetchingConfirmation(false);
                    } else {
                        navigate(`/pitForm/${currentEvent.key}/${pitTeamNumber}`);
                    }
                } else {
                    setPitPopoverError(data.Error);
                    setFetchingConfirmation(false);
                }
            })
            .catch((error) => {
                setPitPopoverError(error);
                setFetchingConfirmation(false);
            });
    }

    if (error) {
        return (
            <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                {error}
            </Box>
        );
    }

    if (loadingCurrentEvent || (currentEventError && error !== false)) {
        return (
            <Center>
                <Spinner></Spinner>
            </Center>
        );
    }

    return (
        <Center>
            {user === 'NoUser' ? (
                <a style={{ marginTop: '100px' }} href={`${config.API_URL}/auth/google`}>
                    <Button _hover={{ textColor: '#1A202C', backgroundColor: 'gray.200' }} _focus={{ outline: 'none' }}>
                        Login with Google
                    </Button>
                </a>
            ) : (
                <Box>
                    <Text textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '85%', lg: '100%' }}>
                        Current Event: {currentEvent.name}
                    </Text>
                    <VStack spacing={'25px'} marginTop={'40px'}>
                        <Button _focus={{ outline: 'none' }} onClick={() => setPitFormDialog(true)}>
                            Pit Form
                        </Button>
                        <AlertDialog
                            closeOnEsc={true}
                            isOpen={pitFormDialog}
                            leastDestructiveRef={cancelRef}
                            onClose={() => {
                                setPitFormDialog(false);
                                setPitTeamNumber('');
                                setPitPopoverError(null);
                                setFetchingConfirmation(false);
                            }}
                        >
                            <AlertDialogOverlay
                                onFocus={() => {
                                    if (inputElement.current) {
                                        inputElement.current.focus();
                                    }
                                }}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter' && pitTeamNumber.trim() !== '' && !fetchingConfirmation) {
                                        handlePitFormConfirm();
                                    }
                                }}
                            >
                                <AlertDialogContent margin={0} w={{ base: '75%', md: '40%', lg: '30%' }} top='25%'>
                                    <AlertDialogHeader color='black' fontSize='lg' fontWeight='bold'>
                                        Enter a team number
                                    </AlertDialogHeader>
                                    <AlertDialogBody>
                                        <Input
                                            ref={inputElement}
                                            type={'number'}
                                            _focus={{ outline: 'none', boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px' }}
                                            borderColor='gray.300'
                                            value={pitTeamNumber}
                                            onChange={(e) => setPitTeamNumber(e.target.value)}
                                        />
                                        {pitPopoverError && (
                                            <Center color={'red.500'} marginTop={'5px'}>
                                                {pitPopoverError}
                                            </Center>
                                        )}
                                    </AlertDialogBody>
                                    <AlertDialogFooter paddingTop={pitPopoverError ? 0 : 'var(--chakra-space-4)'}>
                                        <Button
                                            ref={cancelRef}
                                            onClick={() => {
                                                setPitFormDialog(false);
                                                setPitTeamNumber('');
                                                setPitPopoverError(null);
                                                setFetchingConfirmation(false);
                                            }}
                                            _focus={{ outline: 'none' }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button colorScheme='blue' ml={3} disabled={pitTeamNumber.trim() === '' || fetchingConfirmation} _focus={{ outline: 'none' }} onClick={() => handlePitFormConfirm()}>
                                            Confirm
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialogOverlay>
                        </AlertDialog>
                        <Button _focus={{ outline: 'none' }} _hover={{ textColor: '#1A202C', backgroundColor: 'gray.200' }} as={Link} to={'/preMatchForm'}>
                            Match Form
                        </Button>
                    </VStack>
                </Box>
            )}
        </Center>
    );
}

export default HomePage;
