import { useQuery } from '@apollo/client';
import { ChevronDownIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons';
import { Box, Button, Center, HStack, IconButton, Menu, MenuButton, MenuItem, MenuList, NumberInput, NumberInputField, Spinner, Text } from '@chakra-ui/react';
import { React, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET_CURRENT_EVENT } from '../graphql/queries';
import { v4 as uuidv4 } from 'uuid';

let stations = [
    { label: 'Red Station 1', value: 'r1', id: uuidv4() },
    { label: 'Red Station 2', value: 'r2', id: uuidv4() },
    { label: 'Red Station 3', value: 'r3', id: uuidv4() },
    { label: 'Blue Station 1', value: 'b1', id: uuidv4() },
    { label: 'Blue Station 2', value: 'b2', id: uuidv4() },
    { label: 'Blue Station 3', value: 'b3', id: uuidv4() },
];
let matchTypes = [
    { label: 'Quals', value: 'q', id: uuidv4() },
    { label: 'Quarters', value: 'qf', id: uuidv4() },
    { label: 'Semis', value: 'sf', id: uuidv4() },
    { label: 'Finals', value: 'f', id: uuidv4() },
];

let doGetTeam;

function PreMatchForm() {
    let navigate = useNavigate();

    const [error, setError] = useState(null);
    const [station, setStation] = useState('');
    const [focusedStation, setFocusedStation] = useState('');
    const [matchType, setMatchType] = useState('');
    const [focusedMatchType, setFocusedMatchType] = useState('');
    const [matchNumber1, setMatchNumber1] = useState('');
    const [tieBreaker, setTieBreaker] = useState(false);
    const [fetchingTeam, setFetchingTeam] = useState(false);
    const [teamNumber, setTeamNumber] = useState('');
    const [manualMode, setManualMode] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('PreMatchFormData')) {
            let data = JSON.parse(localStorage.getItem('PreMatchFormData'));
            setStation(data.station);
            setMatchType(data.matchType);
        }
    }, []);

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
                setError('Apollo error, could not retrieve current event data');
            }
        },
    });

    const getMatchKey = useCallback(() => {
        let matchKey;
        if (matchType.value === 'q') {
            if (matchNumber1 === '') {
                return null;
            }
            matchKey = `qm${matchNumber1}`;
        } else {
            if (matchNumber1 === '') {
                return null;
            }
            let param1;
            let param2;
            switch (matchType.value) {
                case 'qf':
                    if (matchNumber1 > 8 || (matchNumber1 > 4 && tieBreaker)) {
                        return null;
                    }
                    param1 = matchNumber1 % 4 === 0 ? 4 : matchNumber1 % 4;
                    param2 = tieBreaker ? 3 : matchNumber1 % 4 === 0 ? matchNumber1 / 4 : Math.floor(matchNumber1 / 4) + 1;
                    break;
                case 'sf':
                    if (matchNumber1 > 4 || (matchNumber1 > 2 && tieBreaker)) {
                        return null;
                    }
                    param1 = matchNumber1 % 2 === 0 ? 2 : matchNumber1 % 2;
                    param2 = tieBreaker ? 3 : matchNumber1 % 2 === 0 ? matchNumber1 / 2 : Math.floor(matchNumber1 / 2) + 1;
                    break;
                case 'f':
                    if (matchNumber1 > 3) {
                        return null;
                    }
                    param1 = 1;
                    param2 = matchNumber1;
                    break;
                default:
                    return null;
            }
            matchKey = `${matchType.value}${param1}m${param2}`;
        }
        return matchKey;
    }, [matchNumber1, tieBreaker, matchType.value]);

    useEffect(() => {
        function getTeamNumber() {
            setTeamNumber('');
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
                        setTeamNumber('');
                        // setError(data.Error);
                    }
                    setFetchingTeam(false);
                })
                .catch((error) => {
                    setFetchingTeam(false);
                    setError(error);
                });
        }
        if (!manualMode) {
            setTeamNumber('');
            clearTimeout(doGetTeam);
            doGetTeam = setTimeout(() => getTeamNumber(), 350);
        }
    }, [station, matchType, matchNumber1, tieBreaker, currentEvent, getMatchKey, manualMode]);

    function validSetup() {
        return station !== '' && matchType !== '' && matchNumber1 !== '' && teamNumber !== '';
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
                    <HStack spacing={'auto'} marginBottom={'20px'}>
                        <Text fontWeight={'bold'} fontSize={'110%'}>
                            Competition: {currentEvent.name}
                        </Text>
                        <IconButton _focus={{ outline: 'none' }} onClick={() => setManualMode(!manualMode)} icon={!manualMode ? <LockIcon /> : <UnlockIcon />}></IconButton>
                    </HStack>
                    <Text marginBottom={'10px'} fontWeight={'bold'} fontSize={'110%'}>
                        Alliance Station:
                    </Text>
                    <Menu>
                        <MenuButton marginLeft={'10px'} onClick={() => setFocusedStation(station)} _focus={{ outline: 'none' }} as={Button} rightIcon={<ChevronDownIcon />}>
                            {station === '' ? 'Choose Station' : station.label}
                        </MenuButton>
                        <MenuList>
                            {stations.map((stationItem) => (
                                <MenuItem
                                    _focus={{ backgroundColor: 'none' }}
                                    onMouseEnter={() => setFocusedStation(stationItem)}
                                    backgroundColor={(station.value === stationItem.value && focusedStation === '') || focusedStation.value === stationItem.value ? 'gray.100' : 'none'}
                                    maxW={'80vw'}
                                    key={stationItem.id}
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
                        <MenuButton marginLeft={'10px'} onClick={() => setFocusedMatchType(matchType)} _focus={{ outline: 'none' }} as={Button} rightIcon={<ChevronDownIcon />}>
                            {matchType === '' ? 'Choose Match Type' : matchType.label}
                        </MenuButton>
                        <MenuList>
                            {matchTypes.map((matchTypeItem) => (
                                <MenuItem
                                    _focus={{ backgroundColor: 'none' }}
                                    onMouseEnter={() => setFocusedMatchType(matchTypeItem)}
                                    backgroundColor={(matchType.value === matchTypeItem.value && focusedMatchType === '') || focusedMatchType.value === matchTypeItem.value ? 'gray.100' : 'none'}
                                    maxW={'80vw'}
                                    key={matchTypeItem.id}
                                    onClick={() => {
                                        setMatchNumber1('');
                                        setTieBreaker(false);
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
                                    placeholder='Enter Match #'
                                />
                            </NumberInput>
                        ) : null}
                        {matchType.value === 'q' || matchType.value === 'f' || matchType === '' ? null : (
                            <Button _focus={{ outline: 'none' }} colorScheme={tieBreaker ? 'green' : 'gray'} onClick={() => setTieBreaker(!tieBreaker)}>
                                Tie
                            </Button>
                        )}
                    </HStack>
                    <HStack spacing={'25px'} pos={'relative'}>
                        <Text marginTop={'10px'} marginBottom={manualMode ? '10px' : '10px'} fontWeight={'bold'} fontSize={'110%'}>
                            Team Number: {!manualMode ? teamNumber : ''}
                        </Text>
                        {fetchingTeam && !manualMode ? <Spinner position={'absolute'} left={'120px'} bottom={'10px'} fontSize={'50px'} /> : null}
                    </HStack>
                    {manualMode ? (
                        <NumberInput
                            marginLeft={'10px'}
                            onChange={(value) => setTeamNumber(value)}
                            value={teamNumber}
                            min={1}
                            precision={0}
                            width={{
                                base: '75%',
                                md: '66%',
                                lg: '50%',
                            }}
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
                                placeholder='Enter Team #'
                            />
                        </NumberInput>
                    ) : null}
                </Box>
                <Center>
                    <Button
                        disabled={!validSetup()}
                        _focus={{ outline: 'none' }}
                        marginBottom={'20px'}
                        marginTop={'20px'}
                        onClick={() => {
                            localStorage.setItem('PreMatchFormData', JSON.stringify({ station, matchType }));
                            navigate(`/matchForm/${currentEvent.key}/${getMatchKey()}/${station.value}/${teamNumber}`);
                        }}
                    >
                        Confirm
                    </Button>
                </Center>
            </Box>
        </Box>
    );
}

export default PreMatchForm;
