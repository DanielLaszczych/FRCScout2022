import { Box, Button, Center, HStack, Text } from '@chakra-ui/react';
import { React, useEffect, useState } from 'react';

function StopWatch({ setParentTimer, initTime }) {
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);
    const [componentMounted, setComponentMounted] = useState(false);

    useEffect(() => {
        if (!componentMounted) {
            setTime(() => initTime);
            setComponentMounted(true);
        }
    }, [initTime, componentMounted]);

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
        if (!running && componentMounted) {
            setParentTimer(time);
        }
    }, [running, time, setParentTimer, componentMounted]);

    return (
        <Box className='stopwatch'>
            <Center>
                <HStack spacing={'5px'} className='numbers'>
                    <Text fontSize={'30px'}>{('0' + Math.floor(((componentMounted ? time : initTime) / 60000) % 60)).slice(-2)}:</Text>
                    <Text fontSize={'30px'}>{('0' + Math.floor(((componentMounted ? time : initTime) / 1000) % 60)).slice(-2)}:</Text>
                    <Text fontSize={'30px'}>{('0' + (((componentMounted ? time : initTime) / 10) % 100)).slice(-2)}</Text>
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
                            setParentTimer(0);
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
