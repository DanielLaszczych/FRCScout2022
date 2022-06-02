import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { Button, Grid, GridItem, IconButton, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Text } from '@chakra-ui/react';
import React from 'react';
import { MdOutlineDoNotDisturbAlt } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { convertMatchKeyToString, convertStationKeyToString } from '../util/helperFunctions';

function MatchesMemo({ matches, currentEvent }) {
    return (
        <div>
            {matches.map((match, index) => (
                <Grid borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} key={match._id} templateColumns='2fr 1fr 1fr 1fr' gap={'5px'}>
                    <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                        <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                            {convertMatchKeyToString(match.matchNumber)} : {convertStationKeyToString(match.station)}
                        </Text>
                    </GridItem>
                    <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                        <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                            {match.teamNumber}
                        </Text>
                    </GridItem>
                    <GridItem padding={'0px 0px 0px 0px'} textAlign={'center'}>
                        <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                            {`${match.scouter.split(' ')[0]}  ${match.scouter.split(' ')[1].charAt(0)}.`}
                        </Text>
                    </GridItem>
                    <GridItem padding={'10px 0px 10px 0px'} textAlign={'center'}>
                        {!match.followUp && !match.noShow ? (
                            <IconButton
                                icon={<CheckCircleIcon />}
                                colorScheme={'green'}
                                _focus={{ outline: 'none' }}
                                size='sm'
                                as={Link}
                                to={`/matchForm/${currentEvent.key}/${match.matchNumber}/${match.station}/${match.teamNumber}`}
                                state={{ previousRoute: 'matches' }}
                            />
                        ) : match.noShow ? (
                            <IconButton
                                icon={<MdOutlineDoNotDisturbAlt />}
                                colorScheme={'red'}
                                _focus={{ outline: 'none' }}
                                size='sm'
                                as={Link}
                                to={`/matchForm/${currentEvent.key}/${match.matchNumber}/${match.station}/${match.teamNumber}`}
                                state={{ previousRoute: 'matches' }}
                            />
                        ) : (
                            <Popover flip={true} placement='bottom'>
                                <PopoverTrigger>
                                    <IconButton icon={<WarningIcon />} colorScheme={'yellow'} _focus={{ outline: 'none' }} size='sm' />
                                </PopoverTrigger>
                                <PopoverContent maxWidth={'50vw'} _focus={{ outline: 'none' }}>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverHeader margin={'0 auto'} maxWidth={'165px'} color='black' fontSize='md' fontWeight='bold'>
                                        Follow Up Comment
                                    </PopoverHeader>
                                    <PopoverBody maxHeight={'125px'} overflowY={'auto'}>
                                        <Text>{match.followUpComment}</Text>
                                    </PopoverBody>
                                    <PopoverFooter>
                                        <Button _focus={{ outline: 'none' }} size='sm' as={Link} to={`/matchForm/${currentEvent.key}/${match.matchNumber}/${match.station}/${match.teamNumber}`} state={{ previousRoute: 'matches' }}>
                                            Go To
                                        </Button>
                                    </PopoverFooter>
                                </PopoverContent>
                            </Popover>
                        )}
                    </GridItem>
                </Grid>
            ))}
        </div>
    );
}

function areEqual(prevProps, nextProps) {
    return prevProps.version === nextProps.version;
}

export default React.memo(MatchesMemo, areEqual);
