import { Box, Button, Grid, GridItem, Spinner, Text } from '@chakra-ui/react';
import React from 'react';
import { TransitionGroup } from 'react-transition-group';
import CSSTransition from './CSSTransition';

function TBAEventsMemo({ eventType, mutatingEventKey, handleAddEvent }) {
    return (
        <Box margin='0 auto' paddingBottom={'25px'}>
            <Box marginBottom={'10px'}>
                <h2 ref={eventType.ref} style={{ fontWeight: '500', fontSize: '30px', lineHeight: '1.1' }}>
                    {eventType.name} <small style={{ fontSize: '65%', color: '#777', lineHeight: '1' }}>{eventType.count} Events</small>
                </h2>
            </Box>
            <TransitionGroup>
                {eventType.events.map((event, index) => (
                    <CSSTransition key={event.key} timeout={500} classNames='shrink'>
                        <Grid minHeight={'61px'} borderTop={'1px solid black'} backgroundColor={index % 2 === 0 ? '#f9f9f9' : 'white'} templateColumns='2fr 1fr' gap={'15px'}>
                            <GridItem marginLeft={'5px'} padding={'0px 0px 0px 0px'} textAlign={'center'}>
                                <Text pos={'relative'} top={'50%'} transform={'translateY(-50%)'}>
                                    {event.name}
                                </Text>
                            </GridItem>
                            <GridItem padding={'10px 0px 10px 0px'} textAlign={'center'}>
                                {mutatingEventKey === event.key ? (
                                    <Spinner marginTop={'8px'}></Spinner>
                                ) : (
                                    <Button _focus={{ outline: 'none' }} disabled={mutatingEventKey !== null} size={'md'} onClick={() => handleAddEvent(event.name, event.year, event.week, eventType.name, event.key, event.start_date, event.end_date)}>
                                        Add
                                    </Button>
                                )}
                            </GridItem>
                        </Grid>
                    </CSSTransition>
                ))}
            </TransitionGroup>
        </Box>
    );
}

function areEqual(prevProps, nextProps) {
    return prevProps.version === nextProps.version && prevProps.mutatingEventKey === nextProps.mutatingEventKey;
}

export default React.memo(TBAEventsMemo, areEqual);
