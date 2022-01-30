import { React, useContext, useRef, useState } from 'react';
import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Center, Input, Spinner, Text, VStack } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth';
import { config } from '../util/constants';
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
                setError('Apollo error, check console for logs');
            }
        },
    });

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
                    <Text textAlign={'center'} fontSize={'25px'} fontWeight={'medium'}>
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
                            }}
                        >
                            <AlertDialogOverlay
                                onFocus={() => {
                                    if (inputElement.current) {
                                        inputElement.current.focus();
                                    }
                                }}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter' && pitTeamNumber.trim() !== '') {
                                        navigate(`/pitForm/${currentEvent.key}/${pitTeamNumber}`);
                                    }
                                }}
                            >
                                <AlertDialogContent margin={0} w={{ base: '75%', md: '40%', lg: '30%' }} top='30%'>
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
                                    </AlertDialogBody>
                                    <AlertDialogFooter>
                                        <Button
                                            ref={cancelRef}
                                            onClick={() => {
                                                setPitFormDialog(false);
                                                setPitTeamNumber('');
                                            }}
                                            _focus={{ outline: 'none' }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button colorScheme='blue' ml={3} disabled={pitTeamNumber.trim() === ''} _focus={{ outline: 'none' }} onClick={() => navigate(`/pitForm/${currentEvent.key}/${pitTeamNumber}`)}>
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
