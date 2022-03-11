import { useMutation, useQuery } from '@apollo/client';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Button, Center, HStack, IconButton, Image, Menu, MenuButton, MenuItem, MenuList, Spinner, useToast } from '@chakra-ui/react';
import { React, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/auth';
import { GET_EVENTS_KEYS_NAMES } from '../graphql/queries';
import { sortRegisteredEvents } from '../util/helperFunctions';
import { FiSave, FiUpload } from 'react-icons/fi';
import { AiOutlineRotateRight } from 'react-icons/ai';
import { GiCancel } from 'react-icons/gi';
import { UPDATE_PITMAP } from '../graphql/mutations';

let rotations = [0, 90, 180, 270];

function PitMapPage() {
    const { user } = useContext(AuthContext);
    const toast = useToast();

    const [error, setError] = useState(null);
    const [events, setEvents] = useState(null);
    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '', pitMap: '' });
    const [focusedEvent, setFocusedEvent] = useState('');
    const hiddenImageInput = useRef(null);
    const [tempImage, setTempImage] = useState(null);
    const [imageRotation, setImageRotation] = useState(0);
    const [uploadingPitMap, setUploadingPitMap] = useState(false);

    const { loading: loadingEvents, error: eventsError } = useQuery(GET_EVENTS_KEYS_NAMES, {
        fetchPolicy: 'network-only',
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, could not retrieve registered events');
        },
        onCompleted({ getEvents: events }) {
            let sortedEvents = sortRegisteredEvents(events);
            setEvents(sortedEvents);
            if (sortedEvents.length > 0) {
                let currentEvent = sortedEvents.find((event) => event.currentEvent);
                if (currentEvent === undefined) {
                    setCurrentEvent({ name: sortedEvents[sortedEvents.length - 1].name, key: sortedEvents[sortedEvents.length - 1].key, pitMap: sortedEvents[sortedEvents.length - 1].pitMapImage });
                    setFocusedEvent(sortedEvents[sortedEvents.length - 1].name);
                } else {
                    setCurrentEvent({ name: currentEvent.name, key: currentEvent.key, pitMap: currentEvent.pitMapImage });
                    setFocusedEvent(currentEvent.name);
                }
            } else {
                setError('No events registered in the database');
            }
        },
    });

    function updateImage(event) {
        if (event.target.files && event.target.files[0] && event.target.files[0].type.split('/')[0] === 'image') {
            var FR = new FileReader();
            FR.readAsDataURL(event.target.files[0]);
            FR.onload = () => {
                setImageRotation(0);
                setTempImage(FR.result);
            };
        }
    }

    const [updatePitMap] = useMutation(UPDATE_PITMAP, {
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            toast({
                title: 'Apollo Error',
                description: 'Pit map was not able to be uploaded',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setUploadingPitMap(false);
            setTempImage(null);
            setImageRotation(0);
            hiddenImageInput.current.value = '';
        },
        onCompleted({ setEventPitMap: modifiedEvent }) {
            let modifiedEvents = events.map((event) => {
                if (event.key === modifiedEvent.key) {
                    return {
                        ...event,
                        pitMapImage: modifiedEvent.pitMapImage,
                    };
                } else {
                    return event;
                }
            });
            setEvents(modifiedEvents);
            setCurrentEvent({ ...currentEvent, pitMap: modifiedEvent.pitMapImage });
            toast({
                title: 'Pit map was uploaded',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setUploadingPitMap(false);
            setTempImage(null);
            setImageRotation(0);
            hiddenImageInput.current.value = '';
        },
    });

    function handleUpdatePitMap() {
        setUploadingPitMap(true);
        updatePitMap({
            variables: {
                key: currentEvent.key,
                image: tempImage,
            },
        });
    }

    useEffect(() => {
        if (localStorage.getItem('PitMapRotation')) {
            setImageRotation(parseInt(localStorage.getItem('PitMapRotation')));
        }
    }, []);

    useEffect(() => {
        if (document.getElementById('imageContainer')) {
            if (imageRotation % 2 === 0) {
                document.getElementById('imageContainer').childNodes[0].style.marginTop = 0;
            } else {
                let imageContainerElement = document.getElementById('imageContainer');
                let imageElement = imageContainerElement.childNodes[0];
                let value = imageElement.clientWidth - imageElement.clientHeight;
                imageElement.style.marginTop = `${value / 2}px`;
            }
        }
        localStorage.setItem('PitMapRotation', imageRotation);
    }, [imageRotation]);

    if (error) {
        return (
            <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                {error}
            </Box>
        );
    }

    if (loadingEvents || currentEvent.key === '' || (eventsError && error !== false)) {
        return (
            <Center>
                <Spinner></Spinner>
            </Center>
        );
    }

    return (
        <Box marginBottom={'25px'}>
            <IconButton position={'absolute'} right={'10px'} top={'95px'} onClick={() => setImageRotation(imageRotation === 3 ? 0 : imageRotation + 1)} icon={<AiOutlineRotateRight />} _focus={{ outline: 'none' }} size='sm' />
            {user.admin && (
                <HStack spacing={'5px'} position={'absolute'} left={'10px'} top={'95px'}>
                    <input type='file' accept='image/*' style={{ display: 'none' }} ref={hiddenImageInput} onChange={(event) => updateImage(event)} />
                    {!tempImage && <IconButton disabled={uploadingPitMap} onClick={() => hiddenImageInput.current.click()} icon={<FiUpload />} _focus={{ outline: 'none' }} size='sm' />}
                    {tempImage && (
                        <IconButton
                            disabled={uploadingPitMap}
                            onClick={() => {
                                setTempImage(null);
                                setImageRotation(0);
                                hiddenImageInput.current.value = '';
                            }}
                            icon={<GiCancel />}
                            color='red'
                            _focus={{ outline: 'none' }}
                            size='sm'
                        />
                    )}
                    {tempImage && <IconButton disabled={uploadingPitMap} onClick={() => handleUpdatePitMap()} icon={uploadingPitMap ? <Spinner /> : <FiSave />} _focus={{ outline: 'none' }} size='sm' />}
                </HStack>
            )}
            <Box margin={'0 auto'} marginBottom={'25px'} textAlign='center' width={{ base: '85%', md: '66%', lg: '50%' }}>
                <Menu placement='bottom'>
                    <MenuButton disabled={uploadingPitMap} maxW={'75vw'} onClick={() => setFocusedEvent('')} _focus={{ outline: 'none' }} as={Button} rightIcon={<ChevronDownIcon />}>
                        <Box overflow={'hidden'} textOverflow={'ellipsis'}>
                            {currentEvent.name}
                        </Box>
                    </MenuButton>
                    <MenuList>
                        {sortRegisteredEvents(events).map((eventItem) => (
                            <MenuItem
                                textAlign={'center'}
                                justifyContent={'center'}
                                _focus={{ backgroundColor: 'none' }}
                                onMouseEnter={() => setFocusedEvent(eventItem.name)}
                                backgroundColor={(currentEvent.name === eventItem.name && focusedEvent === '') || focusedEvent === eventItem.name ? 'gray.100' : 'none'}
                                maxW={'75vw'}
                                key={eventItem.key}
                                onClick={() => {
                                    setCurrentEvent({ name: eventItem.name, key: eventItem.key, pitMap: eventItem.pitMapImage });
                                    setTempImage(null);
                                    setImageRotation(0);
                                    hiddenImageInput.current.value = '';
                                }}
                            >
                                {eventItem.name}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </Box>
            {currentEvent.pitMap || tempImage ? (
                <Center id='imageContainer'>
                    <Image
                        src={tempImage || currentEvent.pitMap}
                        style={{ transform: `rotate(${rotations[imageRotation]}deg)`, transformOrigin: 'center' }}
                        objectFit={'contain'}
                        maxW={imageRotation % 2 === 0 ? '100vw' : 'calc(100vh - 170px)'}
                        maxH={imageRotation % 2 !== 0 ? '100vw' : 'calc(100vh - 170px)'}
                    ></Image>
                </Center>
            ) : (
                <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                    No Pit Map Available
                </Box>
            )}
        </Box>
    );
}

export default PitMapPage;
