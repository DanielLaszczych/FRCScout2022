import { useQuery } from '@apollo/client';
import { ChevronDownIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons';
import { Box, Button, Center, HStack, IconButton, Menu, MenuButton, MenuItem, MenuList, NumberInput, NumberInputField, Spinner, Stack, Text } from '@chakra-ui/react';
import { React, useCallback, useEffect, useState } from 'react';
import { GET_EVENTS_KEYS_NAMES, GET_MATCHFORMS_FOR_ANALYSIS } from '../graphql/queries';
import {
    averageArr,
    countOccurencesForTFField,
    getDefenseRatings,
    getFields,
    getFractionForClimb,
    getHubPercentage,
    getPercentageForTFField,
    getSuccessfulClimbTimes,
    getSucessfulClimbRungMode,
    medianArr,
    roundToHundredth,
    sortRegisteredEvents,
} from '../util/helperFunctions';
import { v4 as uuidv4 } from 'uuid';
import HeatMap from '../components/HeatMap';

let matchTypes = [
    { label: 'Quals', value: 'q', id: uuidv4() },
    { label: 'Quarters', value: 'qf', id: uuidv4() },
    { label: 'Semis', value: 'sf', id: uuidv4() },
    { label: 'Finals', value: 'f', id: uuidv4() },
];

function MatchAnalystPage() {
    const [error, setError] = useState(null);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1200);
    const [currentEvent, setCurrentEvent] = useState({ name: '', key: '' });
    const [focusedEvent, setFocusedEvent] = useState('');
    const [matchType, setMatchType] = useState('');
    const [focusedMatchType, setFocusedMatchType] = useState('');
    const [matchNumber, setMatchNumber] = useState('');
    const [tieBreaker, setTieBreaker] = useState(false);
    const [fetchingTeams, setFetchingTeams] = useState(false);
    const [teams, setTeams] = useState(null);
    const [collapseStates, setCollapseStates] = useState({
        Red1: false,
        Red2: false,
        Red3: false,
        Blue1: false,
        Blue2: false,
        Blue3: false,
    });
    const [manualMode, setManualMode] = useState(false);
    const [matchNumberError, setMatchNumberError] = useState('');
    const [manualTeams, setManualTeams] = useState(null);
    const [dataMedian, setDataMedian] = useState(true);

    const {
        loading: loadingEvents,
        error: eventsError,
        data: { getEvents: events } = {},
    } = useQuery(GET_EVENTS_KEYS_NAMES, {
        fetchPolicy: 'network-only',
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, could not retrieve registered events');
        },
        onCompleted({ getEvents: events }) {
            let sortedEvents = sortRegisteredEvents(events);
            if (sortedEvents.length > 0) {
                let currentEvent = sortedEvents.find((event) => event.currentEvent);
                if (currentEvent === undefined) {
                    setCurrentEvent({ name: sortedEvents[sortedEvents.length - 1].name, key: sortedEvents[sortedEvents.length - 1].key });
                    setFocusedEvent(sortedEvents[sortedEvents.length - 1].name);
                } else {
                    setCurrentEvent({ name: currentEvent.name, key: currentEvent.key });
                    setFocusedEvent(currentEvent.name);
                }
            } else {
                setError('No events registered in the database');
            }
        },
    });

    const updateDesktop = () => {
        setIsDesktop(window.innerWidth > 1200);
    };

    useEffect(() => {
        window.addEventListener('resize', updateDesktop);

        return () => window.removeEventListener('resize', updateDesktop);
    }, []);

    useEffect(() => {
        if (localStorage.getItem('Analysis Match Type')) {
            setMatchType(JSON.parse(localStorage.getItem('Analysis Match Type')));
        }
        if (localStorage.getItem('DataMedian')) {
            setDataMedian(localStorage.getItem('DataMedian') === 'true');
        }
    }, []);

    const getMatchKey = useCallback(() => {
        let matchKey;
        if (matchType.value === 'q') {
            if (matchNumber === '') {
                return null;
            }
            matchKey = `qm${matchNumber}`;
        } else {
            if (matchNumber === '') {
                return null;
            }
            let param1;
            let param2;
            switch (matchType.value) {
                case 'qf':
                    if (matchNumber > 8 || (matchNumber > 4 && tieBreaker)) {
                        setMatchNumberError('Error: Invalid match number for quarters');
                        return null;
                    }
                    param1 = matchNumber % 4 === 0 ? 4 : matchNumber % 4;
                    param2 = tieBreaker ? 3 : matchNumber % 4 === 0 ? matchNumber / 4 : Math.floor(matchNumber / 4) + 1;
                    break;
                case 'sf':
                    if (matchNumber > 4 || (matchNumber > 2 && tieBreaker)) {
                        setMatchNumberError('Error: Invalid match number for semis');
                        return null;
                    }
                    param1 = matchNumber % 2 === 0 ? 2 : matchNumber % 2;
                    param2 = tieBreaker ? 3 : matchNumber % 2 === 0 ? matchNumber / 2 : Math.floor(matchNumber / 2) + 1;
                    break;
                case 'f':
                    if (matchNumber > 3) {
                        setMatchNumberError('Error: Invalid match number for finals');
                        return null;
                    }
                    param1 = 1;
                    param2 = matchNumber;
                    break;
                default:
                    return null;
            }
            matchKey = `${matchType.value}${param1}m${param2}`;
        }
        return matchKey;
    }, [matchNumber, tieBreaker, matchType.value]);

    const getTeams = useCallback(() => {
        let matchKey = getMatchKey();
        if (matchKey === null) {
            return;
        } else {
            setFetchingTeams(true);
            fetch(`/blueAlliance/match/${currentEvent.key}_${matchKey}/simple`)
                .then((response) => response.json())
                .then((data) => {
                    if (!data.Error) {
                        setTeams(data.alliances.red.team_keys.map((team_key) => parseInt(team_key.substring(3))).concat(data.alliances.blue.team_keys.map((team_key) => parseInt(team_key.substring(3)))));
                    } else {
                        setTeams(null);
                        setMatchNumberError(`Error: (${data.Error})`);
                        // setError(data.Error);
                    }
                    setFetchingTeams(false);
                })
                .catch((error) => {
                    setFetchingTeams(false);
                    setError(error);
                });
        }
    }, [currentEvent.key, getMatchKey]);

    const {
        loading: loadingMatchData,
        error: matchDataError,
        data: { getMatchFormsForAnalysis: matchFormsData } = {},
    } = useQuery(GET_MATCHFORMS_FOR_ANALYSIS, {
        skip: teams === null,
        variables: {
            eventKey: currentEvent.key,
            teams: teams !== null ? teams.filter((team) => team !== null) : teams,
        },
        fetchPolicy: 'network-only',
        onError(err) {
            console.log(JSON.stringify(err, null, 2));
            setError('Apollo error, could not retrieve match forms');
        },
    });

    function setAllToShow() {
        let newStates = {
            Red1: false,
            Red2: false,
            Red3: false,
            Blue1: false,
            Blue2: false,
            Blue3: false,
        };
        setCollapseStates(newStates);
    }

    useEffect(() => {
        setTeams(null);
        setMatchNumberError('');
        setMatchNumber('');
        setManualTeams([
            { id: uuidv4(), teamNumber: '' },
            { id: uuidv4(), teamNumber: '' },
            { id: uuidv4(), teamNumber: '' },
            { id: uuidv4(), teamNumber: '' },
            { id: uuidv4(), teamNumber: '' },
            { id: uuidv4(), teamNumber: '' },
        ]);
    }, [manualMode]);

    useEffect(() => {
        localStorage.setItem('DataMedian', dataMedian);
    }, [dataMedian]);

    function renderTeamData(teamNumber, allianceColor, station) {
        let teamMatchForms = matchFormsData.filter((matchForm) => matchForm.teamNumber === teamNumber);
        if (teamMatchForms.length === 0) {
            return (
                <div className='grid'>
                    <div className='grid-column'>
                        <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                            {teamNumber}
                        </div>
                        <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                            {allianceColor} Station {station}
                        </div>
                    </div>
                    <div className='grid-column'>
                        <div className='grid-item'>
                            <Text textAlign={'center'}>No Data Available</Text>
                        </div>
                    </div>
                </div>
            );
        } else if (!collapseStates[`${allianceColor}${station}`]) {
            if (!isDesktop) {
                return (
                    <div className='grid'>
                        <div className='grid-column'>
                            <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                {teamMatchForms[0].teamNumber}
                            </div>
                            <div
                                onClick={() => {
                                    let modifiedCollapseStates = { ...collapseStates };
                                    modifiedCollapseStates[`${allianceColor}${station}`] = !modifiedCollapseStates[`${allianceColor}${station}`];
                                    setCollapseStates(modifiedCollapseStates);
                                }}
                                className='grid-item header'
                                style={{ flexGrow: 0.2, cursor: 'pointer', background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}
                            >
                                {collapseStates[`${allianceColor}${station}`] ? 'Show' : 'Hide'}
                            </div>
                            <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                {allianceColor} Station {station}
                            </div>
                        </div>
                        <div className='grid-column'>
                            <div className='grid-item header' style={{ flexGrow: 2 / 3, flexShrink: 1 / 3, flexBasis: '100%', background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                Heat Map
                            </div>
                            <div className='grid-item header' style={{ flexGrow: 1 / 3, flexShrink: 2 / 3, flexBasis: '100%', background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                Auto
                            </div>
                        </div>
                        <div className='grid-column'>
                            <div className='grid-item' style={{ flexGrow: 2 / 3, flexShrink: 1 / 3, flexBasis: '100%' }}>
                                <Center paddingTop={'5px'} paddingBottom={'5px'} pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    <HeatMap data={teamMatchForms} largeScale={0.15} mediumScale={0.3} smallScale={0.6} maxOccurances={3}></HeatMap>
                                </Center>
                            </div>
                            <div className='grid-item' style={{ flexGrow: 1 / 3, flexShrink: 2 / 3, flexBasis: '100%' }}>
                                <div className='grid-text-item'>
                                    Lower Hub ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getFields(teamMatchForms, 'lowerCargoAuto')) : averageArr(getFields(teamMatchForms, 'lowerCargoAuto'))}
                                </div>
                                <div className='grid-text-item'>
                                    Upper Hub ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getFields(teamMatchForms, 'upperCargoAuto')) : averageArr(getFields(teamMatchForms, 'upperCargoAuto'))}
                                </div>
                                <div className='grid-text-item'>
                                    Missed ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getFields(teamMatchForms, 'missedAuto')) : averageArr(getFields(teamMatchForms, 'missedAuto'))}
                                </div>
                                <div className='grid-text-item'>
                                    Hub Percentage:{' '}
                                    {teamMatchForms.find((matchForm) => matchForm.missedAuto > 0 || matchForm.lowerCargoAuto > 0 || matchForm.upperCargoAuto > 0) ? `${roundToHundredth(getHubPercentage(teamMatchForms, 'Auto') * 100)}%` : 'N/A'}
                                </div>
                                <div>Taxi Percentage: {roundToHundredth(getPercentageForTFField(teamMatchForms, 'crossTarmac') * 100)}%</div>
                            </div>
                        </div>
                        <div className='grid-column'>
                            <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                Teleop
                            </div>
                            <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                End-Game
                            </div>
                            <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                Post-Game
                            </div>
                        </div>
                        <div className='grid-column'>
                            <div className='grid-item'>
                                <div className='grid-text-item'>
                                    Lower Hub ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getFields(teamMatchForms, 'lowerCargoTele')) : averageArr(getFields(teamMatchForms, 'lowerCargoTele'))}
                                </div>
                                <div className='grid-text-item'>
                                    Upper Hub ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getFields(teamMatchForms, 'upperCargoTele')) : averageArr(getFields(teamMatchForms, 'upperCargoTele'))}
                                </div>
                                <div className='grid-text-item'>
                                    Missed ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getFields(teamMatchForms, 'missedTele')) : averageArr(getFields(teamMatchForms, 'missedTele'))}
                                </div>
                                <div>
                                    Hub Percentage:{' '}
                                    {teamMatchForms.find((matchForm) => matchForm.missedTele > 0 || matchForm.lowerCargoTele > 0 || matchForm.upperCargoTele > 0) ? `${roundToHundredth(getHubPercentage(teamMatchForms, 'Tele') * 100)}%` : 'N/A'}
                                </div>
                            </div>
                            <div className='grid-item'>
                                <div className='grid-text-item'>Climb Success Rate: {getFractionForClimb(teamMatchForms)}</div>
                                <div className='grid-text-item'>
                                    Climb Time ({dataMedian ? 'Med.' : 'Avg.'}):{' '}
                                    {teamMatchForms.filter((a) => a.climbTime > 0 && a.climbRung !== 'Failed').length > 0
                                        ? `${dataMedian ? roundToHundredth(medianArr(getSuccessfulClimbTimes(teamMatchForms, false)) / 1000) : roundToHundredth(averageArr(getSuccessfulClimbTimes(teamMatchForms, false)) / 1000)} sec`
                                        : 'N/A'}
                                </div>
                                <div>Common Rung(s): {getSucessfulClimbRungMode(teamMatchForms)}</div>
                            </div>
                            <div className='grid-item'>
                                <div className='grid-text-item'>
                                    Playing Defense ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getDefenseRatings(teamMatchForms)) : averageArr(getDefenseRatings(teamMatchForms))}
                                </div>
                                <div className='grid-text-item'># of Lose Comm. : {countOccurencesForTFField(teamMatchForms, 'loseCommunication')}</div>
                                <div className='grid-text-item'># of Robot Break: {countOccurencesForTFField(teamMatchForms, 'robotBreak')}</div>
                                <div className='grid-text-item'># of Yellow Card: {countOccurencesForTFField(teamMatchForms, 'yellowCard')}</div>
                                <div># of Red Card: {countOccurencesForTFField(teamMatchForms, 'redCard')}</div>
                            </div>
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className='grid'>
                        <div className='grid-column'>
                            <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                {teamMatchForms[0].teamNumber}
                            </div>
                            <div
                                onClick={() => {
                                    let modifiedCollapseStates = { ...collapseStates };
                                    modifiedCollapseStates[`${allianceColor}${station}`] = !modifiedCollapseStates[`${allianceColor}${station}`];
                                    setCollapseStates(modifiedCollapseStates);
                                }}
                                className='grid-item header'
                                style={{ flexGrow: 0.2, cursor: 'pointer', background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}
                            >
                                {collapseStates[`${allianceColor}${station}`] ? 'Show' : 'Hide'}
                            </div>
                            <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                {allianceColor} Station {station}
                            </div>
                        </div>
                        <div className='grid-column'>
                            <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                Heat Map
                            </div>
                            <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                Auto
                            </div>
                            <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                Teleop
                            </div>
                            <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                End-Game
                            </div>
                            <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                                Post-Game
                            </div>
                        </div>
                        <div className='grid-column'>
                            <div className='grid-item'>
                                <Center paddingTop={'5px'} paddingBottom={'5px'} pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    <HeatMap data={teamMatchForms} largeScale={0.15} mediumScale={0.3} smallScale={0.6} maxOccurances={3}></HeatMap>
                                </Center>
                            </div>
                            <div className='grid-item'>
                                <div className='grid-text-item'>
                                    Lower Hub ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getFields(teamMatchForms, 'lowerCargoAuto')) : averageArr(getFields(teamMatchForms, 'lowerCargoAuto'))}
                                </div>
                                <div className='grid-text-item'>
                                    Upper Hub ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getFields(teamMatchForms, 'upperCargoAuto')) : averageArr(getFields(teamMatchForms, 'upperCargoAuto'))}
                                </div>
                                <div className='grid-text-item'>
                                    Missed ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getFields(teamMatchForms, 'missedAuto')) : averageArr(getFields(teamMatchForms, 'missedAuto'))}
                                </div>
                                <div className='grid-text-item'>
                                    Hub Percentage:{' '}
                                    {teamMatchForms.find((matchForm) => matchForm.missedAuto > 0 || matchForm.lowerCargoAuto > 0 || matchForm.upperCargoAuto > 0) ? `${roundToHundredth(getHubPercentage(teamMatchForms, 'Auto') * 100)}%` : 'N/A'}
                                </div>
                                <div>Taxi Percentage: {roundToHundredth(getPercentageForTFField(teamMatchForms, 'crossTarmac') * 100)}%</div>
                            </div>
                            <div className='grid-item'>
                                <div className='grid-text-item'>
                                    Lower Hub ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getFields(teamMatchForms, 'lowerCargoTele')) : averageArr(getFields(teamMatchForms, 'lowerCargoTele'))}
                                </div>
                                <div className='grid-text-item'>
                                    Upper Hub ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getFields(teamMatchForms, 'upperCargoTele')) : averageArr(getFields(teamMatchForms, 'upperCargoTele'))}
                                </div>
                                <div className='grid-text-item'>
                                    Missed ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getFields(teamMatchForms, 'missedTele')) : averageArr(getFields(teamMatchForms, 'missedTele'))}
                                </div>
                                <div>
                                    Hub Percentage:{' '}
                                    {teamMatchForms.find((matchForm) => matchForm.missedTele > 0 || matchForm.lowerCargoTele > 0 || matchForm.upperCargoTele > 0) ? `${roundToHundredth(getHubPercentage(teamMatchForms, 'Tele') * 100)}%` : 'N/A'}
                                </div>
                            </div>
                            <div className='grid-item'>
                                <div className='grid-text-item'>Climb Success Rate: {getFractionForClimb(teamMatchForms)}</div>
                                <div className='grid-text-item'>
                                    Climb Time ({dataMedian ? 'Med.' : 'Avg.'}):{' '}
                                    {teamMatchForms.filter((a) => a.climbTime > 0 && a.climbRung !== 'Failed').length > 0
                                        ? `${dataMedian ? medianArr(getSuccessfulClimbTimes(teamMatchForms)) / 1000 : averageArr(getSuccessfulClimbTimes(teamMatchForms)) / 1000} sec`
                                        : 'N/A'}
                                </div>
                                <div>Common Rung(s): {getSucessfulClimbRungMode(teamMatchForms)}</div>
                            </div>
                            <div className='grid-item'>
                                <div className='grid-text-item'>
                                    Playing Defense ({dataMedian ? 'Med.' : 'Avg.'}): {dataMedian ? medianArr(getDefenseRatings(teamMatchForms)) : averageArr(getDefenseRatings(teamMatchForms))}
                                </div>
                                <div className='grid-text-item'># of Lose Comm. : {countOccurencesForTFField(teamMatchForms, 'loseCommunication')}</div>
                                <div className='grid-text-item'># of Robot Break: {countOccurencesForTFField(teamMatchForms, 'robotBreak')}</div>
                                <div className='grid-text-item'># of Yellow Card: {countOccurencesForTFField(teamMatchForms, 'yellowCard')}</div>
                                <div># of Red Card: {countOccurencesForTFField(teamMatchForms, 'redCard')}</div>
                            </div>
                        </div>
                    </div>
                );
            }
        } else {
            return (
                <div className='grid'>
                    <div className='grid-column'>
                        <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                            {teamMatchForms[0].teamNumber}
                        </div>
                        <div
                            onClick={() => {
                                let modifiedCollapseStates = { ...collapseStates };
                                modifiedCollapseStates[`${allianceColor}${station}`] = !modifiedCollapseStates[`${allianceColor}${station}`];
                                setCollapseStates(modifiedCollapseStates);
                            }}
                            className='grid-item header'
                            style={{ flexGrow: 0.2, cursor: 'pointer', background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}
                        >
                            {collapseStates[`${allianceColor}${station}`] ? 'Show' : 'Hide'}
                        </div>
                        <div className='grid-item header' style={{ background: allianceColor === 'Red' ? 'var(--chakra-colors-red-400)' : 'var(--chakra-colors-blue-400)' }}>
                            {allianceColor} Station {station}
                        </div>
                    </div>
                </div>
            );
        }
    }

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
            <Stack direction={{ base: 'column', sm: 'row' }} position={'absolute'} right={'10px'} top={'95px'}>
                <IconButton _focus={{ outline: 'none' }} size={'sm'} onClick={() => setManualMode(!manualMode)} icon={!manualMode ? <LockIcon /> : <UnlockIcon />}></IconButton>
                <Button maxWidth={'32px'} onClick={() => setDataMedian(!dataMedian)} _focus={{ outline: 'none' }} size='sm'>
                    {dataMedian ? 'M' : 'A'}
                </Button>
            </Stack>
            <Box margin={'0 auto'} marginBottom={'25px'} textAlign='center' width={{ base: '85%', md: '66%', lg: '50%' }}>
                <Box marginBottom={'15px'}>
                    <Menu placement='bottom'>
                        <MenuButton maxW={'75vw'} onClick={() => setFocusedEvent('')} _focus={{ outline: 'none' }} as={Button} rightIcon={<ChevronDownIcon />}>
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
                                        setTeams(null);
                                        setCurrentEvent({ name: eventItem.name, key: eventItem.key });
                                    }}
                                >
                                    {eventItem.name}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                </Box>
                {!manualMode ? (
                    <Box>
                        <Box marginBottom={'15px'}>
                            <Menu placement='bottom'>
                                <MenuButton maxW={'75vw'} onClick={() => setFocusedMatchType(matchType)} _focus={{ outline: 'none' }} as={Button} rightIcon={<ChevronDownIcon />}>
                                    <Box overflow={'hidden'} textOverflow={'ellipsis'}>
                                        {matchType === '' ? 'Choose Match Type' : matchType.label}
                                    </Box>
                                </MenuButton>
                                <MenuList>
                                    {matchTypes.map((matchTypeItem) => (
                                        <MenuItem
                                            textAlign={'center'}
                                            justifyContent={'center'}
                                            _focus={{ backgroundColor: 'none' }}
                                            onMouseEnter={() => setFocusedMatchType(matchTypeItem)}
                                            backgroundColor={(matchType.value === matchTypeItem.value && focusedMatchType === '') || focusedMatchType.value === matchTypeItem.value ? 'gray.100' : 'none'}
                                            maxW={'75vw'}
                                            key={matchTypeItem.id}
                                            onClick={() => {
                                                setMatchNumber('');
                                                setTieBreaker(false);
                                                setMatchType(matchTypeItem);
                                            }}
                                        >
                                            {matchTypeItem.label}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </Menu>
                        </Box>
                        <HStack margin={'0 auto'} marginBottom={'15px'} justifyContent='center' width={{ base: '85%', md: '66%', lg: '50%' }}>
                            {matchType !== '' ? (
                                <NumberInput value={matchNumber} onChange={(value) => setMatchNumber(value !== '' ? parseInt(value) : '')} precision={0}>
                                    <NumberInputField
                                        h={'45px'}
                                        padding={'0px'}
                                        textAlign={'center'}
                                        onKeyPress={(event) => {
                                            if (event.key === 'Enter') {
                                                event.target.blur();
                                                if (matchNumber) {
                                                    setMatchNumberError('');
                                                    getTeams();
                                                    setAllToShow();
                                                    localStorage.setItem('Analysis Match Type', JSON.stringify(matchType));
                                                }
                                            }
                                        }}
                                        enterKeyHint='search'
                                        _focus={{
                                            outline: 'none',
                                        }}
                                        borderRadius={'5px'}
                                        placeholder='Match Number'
                                    />
                                </NumberInput>
                            ) : null}
                            {matchType.value === 'q' || matchType.value === 'f' || matchType === '' ? null : (
                                <Button _focus={{ outline: 'none' }} colorScheme={tieBreaker ? 'green' : 'gray'} onClick={() => setTieBreaker(!tieBreaker)}>
                                    Tie
                                </Button>
                            )}
                        </HStack>{' '}
                    </Box>
                ) : (
                    <Box margin={'0 auto'} marginBottom={'15px'} width={{ base: '100%', md: '66%', lg: '50%' }}>
                        <HStack marginBottom={'15px'}>
                            {manualTeams !== null &&
                                manualTeams.slice(0, 3).map((team, index) => (
                                    <NumberInput
                                        key={team.id}
                                        value={team.teamNumber}
                                        onChange={(value) =>
                                            setManualTeams((prevManualTeams) =>
                                                prevManualTeams.map((prevTeam) => {
                                                    if (prevTeam.id === team.id) {
                                                        return { ...prevTeam, teamNumber: value !== '' ? parseInt(value) : '' };
                                                    } else {
                                                        return prevTeam;
                                                    }
                                                })
                                            )
                                        }
                                        precision={0}
                                    >
                                        <NumberInputField
                                            h={'45px'}
                                            padding={'0px'}
                                            textAlign={'center'}
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    let filteredTeams = manualTeams.map((team) => (team.teamNumber !== '' ? team.teamNumber : null));
                                                    setTeams(filteredTeams);
                                                    setAllToShow();
                                                }
                                            }}
                                            enterKeyHint='done'
                                            _focus={{
                                                outline: 'none',
                                            }}
                                            borderRadius={'5px'}
                                            placeholder={`Red ${index + 1}`}
                                        />
                                    </NumberInput>
                                ))}
                        </HStack>
                        <HStack>
                            {manualTeams !== null &&
                                manualTeams.slice(3).map((team, index) => (
                                    <NumberInput
                                        key={team.id}
                                        value={team.teamNumber}
                                        onChange={(value) =>
                                            setManualTeams((prevManualTeams) =>
                                                prevManualTeams.map((prevTeam) => {
                                                    if (prevTeam.id === team.id) {
                                                        return { ...prevTeam, teamNumber: value !== '' ? parseInt(value) : '' };
                                                    } else {
                                                        return prevTeam;
                                                    }
                                                })
                                            )
                                        }
                                        precision={0}
                                    >
                                        <NumberInputField
                                            h={'45px'}
                                            padding={'0px'}
                                            textAlign={'center'}
                                            onKeyPress={(event) => {
                                                if (event.key === 'Enter') {
                                                    let filteredTeams = manualTeams.map((team) => (team.teamNumber !== '' ? team.teamNumber : null));
                                                    setTeams(filteredTeams);
                                                    setAllToShow();
                                                }
                                            }}
                                            enterKeyHint='done'
                                            _focus={{
                                                outline: 'none',
                                            }}
                                            borderRadius={'5px'}
                                            placeholder={`Blue ${index + 1}`}
                                        />
                                    </NumberInput>
                                ))}
                        </HStack>
                    </Box>
                )}
                <Button
                    marginBottom={'15px'}
                    _focus={{ outline: 'none' }}
                    disabled={!manualMode && !matchNumber}
                    onClick={() => {
                        if (manualMode) {
                            let filteredTeams = manualTeams.map((team) => (team.teamNumber !== '' ? team.teamNumber : null));
                            setTeams(filteredTeams);
                            setAllToShow();
                        } else {
                            setMatchNumberError('');
                            getTeams();
                            setAllToShow();
                            localStorage.setItem('Analysis Match Type', JSON.stringify(matchType));
                        }
                    }}
                >
                    Search
                </Button>
            </Box>
            {fetchingTeams || loadingMatchData || (matchDataError && error !== false) ? (
                <Center>
                    <Spinner></Spinner>
                </Center>
            ) : matchNumberError !== '' ? (
                <Text textAlign={'center'} color={'red.500'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '85%', lg: '100%' }}>
                    {matchNumberError}
                </Text>
            ) : teams !== null ? (
                <Box>
                    {teams[0] !== null && renderTeamData(teams[0], 'Red', 1)}
                    {teams[1] !== null && renderTeamData(teams[1], 'Red', 2)}
                    {teams[2] !== null && renderTeamData(teams[2], 'Red', 3)}
                    {teams[3] !== null && renderTeamData(teams[3], 'Blue', 1)}
                    {teams[4] !== null && renderTeamData(teams[4], 'Blue', 2)}
                    {teams[5] !== null && renderTeamData(teams[5], 'Blue', 3)}
                </Box>
            ) : null}
        </Box>
    );
}

export default MatchAnalystPage;
