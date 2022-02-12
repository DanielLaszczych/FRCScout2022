import { Box, Button, Center, HStack, Text } from '@chakra-ui/react';
import { React, useEffect, useRef, useState } from 'react';

function StopWatch({ setMatchFormData, initTime }) {
    const [time, setTime] = useState(null);
    const [running, setRunning] = useState(false);
    const skippedFirstSet = useRef(false);

    useEffect(() => {
        if (!skippedFirstSet.current) {
            setTime(() => initTime);
        }
    }, [initTime]);

    useEffect(() => {
        let interval;
        if (running) {
            interval = setInterval(() => {
                setTime((prevTime) => {
                    return prevTime + 10;
                });
            }, 10);
        } else if (!running) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [running]);

    useEffect(() => {
        if (!running && skippedFirstSet.current) {
            setMatchFormData((prevState) => ({ ...prevState, climbTime: time }));
        } else if (time !== null) {
            skippedFirstSet.current = true;
        }
    }, [running, time, setMatchFormData]);

    return (
        <Box className='stopwatch'>
            <Center>
                <HStack spacing={'5px'} className='numbers'>
                    <Text fontSize={'30px'}>{('0' + Math.floor(((skippedFirstSet.current ? time : initTime) / 60000) % 60)).slice(-2)}:</Text>
                    <Text fontSize={'30px'}>{('0' + Math.floor(((skippedFirstSet.current ? time : initTime) / 1000) % 60)).slice(-2)}:</Text>
                    <Text fontSize={'30px'}>{('0' + (((skippedFirstSet.current ? time : initTime) / 10) % 100)).slice(-2)}</Text>
                </HStack>
            </Center>
            <Center>
                <HStack className='buttons'>
                    <Button _focus={{ outline: 'none' }} colorScheme={running ? 'red' : 'green'} minW={'75px'} onClick={() => setRunning((prevState) => !prevState)}>
                        {running ? 'Pause' : 'Start'}
                    </Button>
                    <Button
                        disabled={running}
                        _focus={{ outline: 'none' }}
                        colorScheme={'red'}
                        minW={'75px'}
                        onClick={() => {
                            setRunning(false);
                            setTime(0);
                            setMatchFormData((prevState) => ({ ...prevState, climbTime: 0, climbRung: null }));
                        }}
                    >
                        Reset
                    </Button>
                </HStack>
            </Center>
        </Box>
    );
}

export default StopWatch;
