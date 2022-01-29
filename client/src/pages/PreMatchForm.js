import { useQuery } from '@apollo/client';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Button, Center, HStack, Menu, MenuButton, MenuItem, MenuList, NumberInput, NumberInputField, Spinner, Text } from '@chakra-ui/react';
import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET_CURRENT_EVENT } from '../graphql/queries';

let stations = [
    { label: 'Red Station 1', value: 'r1' },
    { label: 'Red Station 2', value: 'r2' },
    { label: 'Red Station 3', value: 'r3' },
    { label: 'Blue Station 1', value: 'b1' },
    { label: 'Blue Station 2', value: 'b2' },
    { label: 'Blue Station 3', value: 'b3' },
];
let matchTypes = [
    { label: 'Quals', value: 'q' },
    { label: 'Quarters', value: 'qf' },
    { label: 'Semis', value: 'sf' },
    { label: 'Finals', value: 'f' },
];

function PreMatchForm() {
    let navigate = useNavigate();

    const [error, setError] = useState(null);
    const [station, setStation] = useState('');
    const [focusedStation, setFocusedStation] = useState('');
    const [matchType, setMatchType] = useState('');
    const [focusedMatchType, setFocusedMatchType] = useState('');
    const [matchNumber1, setMatchNumber1] = useState('');
    const [matchNumber2, setMatchNumber2] = useState('');
    const [fetchingTeam, setFetchingTeam] = useState(false);
    const [teamNumber, setTeamNumber] = useState('');

    const {
        loading: loadingCurrentEvent,
        error: currentEventError,
        data: { getCurrentEvent: currentEvent } = {},
    } = useQuery(GET_CURRENT_EVENT, {
        onError(err) {
            if (err.message === 'Error: There is no current event') {
                setError('There is no current event');
            } else {
                console.log(JSON.stringify(err, null, 2));
                setError('Apollo error, check console for logs');
            }
        },
    });

    function getMatchKey() {
        let matchKey;
        if (matchType.value === 'q') {
            if (matchNumber1 === '') {
                return null;
            }
            matchKey = `qm${matchNumber1}`;
        } else {
            if (matchNumber1 === '' || matchNumber2 === '') {
                return null;
            }
            matchKey = `${matchType.value}${matchNumber1}m${matchNumber2}`;
        }
        return matchKey;
    }

    useEffect(() => {
        setTeamNumber('');
        function getTeamNumber() {
            if (station === '' || matchType === '') return;
            let matchKey = getMatchKey();
            if (matchKey === null) {
                return;
            }
            setFetchingTeam(true);
            fetch(`/blueAlliance/match/${currentEvent.key}_${matchKey}/simple`)
                .then((response) => response.json())
                .then((data) => {
                    if (!data.Error) {
                        let teamNumber;
                        let stationNumber = parseInt(station.value.charAt(1)) - 1;
                        if (station.value.charAt(0) === 'r') {
                            teamNumber = data.alliances.red.team_keys[stationNumber].substring(3);
                        } else {
                            teamNumber = data.alliances.blue.team_keys[stationNumber].substring(3);
                        }
                        setTeamNumber(teamNumber);
                    } else {
                        setError(data.Error);
                    }
                    setFetchingTeam(false);
                })
                .catch((error) => {
                    setFetchingTeam(false);
                    setError(error);
                });
        }
        getTeamNumber();
    }, [station, matchType, matchNumber1, matchNumber2]); // eslint-disable-line react-hooks/exhaustive-deps

    function validSetup() {
        return station !== '' && matchType !== '' && matchNumber1 !== '' && (matchType.value !== 'q' ? matchNumber2 !== '' : true) && teamNumber !== '';
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
        <Box margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
            <Box>
                <Box border={'black solid'} borderRadius={'10px'} padding={'10px'}>
                    <Text marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                        Competition: {currentEvent.name}
                    </Text>
                    <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                        Alliance Station:
                    </Text>
                    <Menu>
                        <MenuButton
                            marginLeft={'10px'}
                            onClick={() => setFocusedStation(station)}
                            _focus={{ outline: 'none' }}
                            textOverflow={'ellipsis'}
                            whiteSpace={'nowrap'}
                            overflow={'hidden'}
                            textAlign={'center'}
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                        >
                            {station === '' ? 'Choose Station' : station.label}
                        </MenuButton>
                        <MenuList textAlign={'center'}>
                            {stations.map((stationItem, index) => (
                                <MenuItem
                                    _focus={{ backgroundColor: 'none' }}
                                    onMouseEnter={() => setFocusedStation(stationItem)}
                                    backgroundColor={(station.value === stationItem.value && focusedStation === '') || focusedStation.value === stationItem.value ? 'gray.100' : 'none'}
                                    maxW={'80vw'}
                                    textAlign={'center'}
                                    key={index}
                                    onClick={() => setStation(stationItem)}
                                >
                                    {stationItem.label}
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
                            onClick={() => setFocusedMatchType(matchType)}
                            _focus={{ outline: 'none' }}
                            textOverflow={'ellipsis'}
                            whiteSpace={'nowrap'}
                            overflow={'hidden'}
                            textAlign={'center'}
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                        >
                            {matchType === '' ? 'Choose Match Type' : matchType.label}
                        </MenuButton>
                        <MenuList textAlign={'center'}>
                            {matchTypes.map((matchTypeItem, index) => (
                                <MenuItem
                                    _focus={{ backgroundColor: 'none' }}
                                    onMouseEnter={() => setFocusedMatchType(matchTypeItem)}
                                    backgroundColor={(matchType.value === matchTypeItem.value && focusedMatchType === '') || focusedMatchType.value === matchTypeItem.value ? 'gray.100' : 'none'}
                                    maxW={'80vw'}
                                    textAlign={'center'}
                                    key={index}
                                    onClick={() => {
                                        setMatchNumber1('');
                                        setMatchNumber2('');
                                        setMatchType(matchTypeItem);
                                    }}
                                >
                                    {matchTypeItem.label}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <HStack marginTop={'10px'}>
                        {matchType !== '' ? (
                            <NumberInput
                                marginLeft={'10px'}
                                onChange={(value) => setMatchNumber1(value)}
                                value={matchNumber1}
                                min={1}
                                precision={0}
                                width={{
                                    base: matchType === 'Quals' ? '75%' : '45%',
                                    md: '66%',
                                    lg: '50%',
                                }}
                            >
                                <NumberInputField
                                    enterKeyHint='done'
                                    _focus={{
                                        outline: 'none',
                                        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px',
                                    }}
                                    textAlign={'center'}
                                    placeholder='Enter Match #'
                                />
                            </NumberInput>
                        ) : null}
                        {matchType.value === 'q' || matchType === '' ? null : <Text>-</Text>}
                        {matchType.value === 'q' || matchType === '' ? null : (
                            <NumberInput
                                marginLeft={'10px'}
                                onChange={(value) => setMatchNumber2(value)}
                                value={matchNumber2}
                                min={1}
                                precision={0}
                                width={{
                                    base: matchType === 'Quals' ? '75%' : '45%',
                                    md: '66%',
                                    lg: '50%',
                                }}
                            >
                                <NumberInputField
                                    enterKeyHint='done'
                                    _focus={{
                                        outline: 'none',
                                        boxShadow: 'rgba(0, 0, 0, 0.35) 0px 3px 8px',
                                    }}
                                    textAlign={'center'}
                                    placeholder='Enter Match #'
                                />
                            </NumberInput>
                        )}
                    </HStack>
                    <HStack spacing={'25px'} pos={'relative'}>
                        <Text marginTop={'10px'} marginBottom={'20px'} fontWeight={'bold'} fontSize={'110%'}>
                            Team Number: {teamNumber}
                        </Text>
                        {fetchingTeam ? <Spinner position={'absolute'} left={'120px'} bottom={'19px'} fontSize={'50px'} /> : null}
                    </HStack>
                </Box>
                <Center>
                    <Button disabled={!validSetup()} _focus={{ outline: 'none' }} marginBottom={'20px'} marginTop={'20px'} onClick={() => navigate(`/matchForm/${currentEvent.key}/${getMatchKey()}/${station.value}`)}>
                        Confirm
                    </Button>
                </Center>
            </Box>
        </Box>
    );
}

export default PreMatchForm;
