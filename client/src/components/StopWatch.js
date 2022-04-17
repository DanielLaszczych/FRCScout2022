import { Box, Button, Center, HStack, Text } from '@chakra-ui/react';
import { React, useEffect, useRef, useState } from 'react';

let interval;
function StopWatch({ setMatchFormData, initTimeParam }) {
    const [time, setTime] = useState(null);
    const [running, setRunning] = useState(false);
    const skippedFirstSet = useRef(false);

    useEffect(() => {
        if (!skippedFirstSet.current) {
            setTime(() => initTimeParam);
        }
    }, [initTimeParam]);

    useEffect(() => {
        let startTime = Date.now() - time;
        if (running) {
            interval = setInterval(() => {
                let newTime = Date.now() - startTime;
                setTime(() => newTime);
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
                    <Text fontSize={'30px'}>{('0' + Math.floor(((skippedFirstSet.current ? time : initTimeParam) / 60000) % 60)).slice(-2)}:</Text>
                    <Text fontSize={'30px'}>{('0' + Math.floor(((skippedFirstSet.current ? time : initTimeParam) / 1000) % 60)).slice(-2)}:</Text>
                    <Text fontSize={'30px'}>{(skippedFirstSet.current ? time : initTimeParam) % 1000 === 0 ? '00' : ('0' + Math.round(((skippedFirstSet.current ? time : initTimeParam) % 1000) / 10)).slice(-2)}</Text>
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
