import { Box, Button, Center, HStack, Text } from '@chakra-ui/react';
import { React, useEffect, useRef, useState } from 'react';

let interval;
function StopWatch({ setMatchFormData, initTimeParam }) {
    const timeRef = useRef(null);
    const [time, setTime] = useState(null);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        setTime(initTimeParam);
        timeRef.current = initTimeParam;
    }, [initTimeParam]);

    useEffect(() => {
        if (running) {
            let startTime = Date.now() - timeRef.current;
            interval = setInterval(() => {
                let newTime = Date.now() - startTime;
                setTime(newTime);
                timeRef.current = newTime;
            }, 10);
        } else if (!running) {
            console.log(timeRef.current);
            clearInterval(interval);
            setMatchFormData((prevState) => ({ ...prevState, climbTime: timeRef.current }));
        }
        return () => clearInterval(interval);
    }, [running, setMatchFormData]);

    return (
        <Box className='stopwatch'>
            <Center>
                <HStack spacing={'5px'} className='numbers'>
                    <Text fontSize={'30px'}>{('0' + Math.floor(((time === 0 ? time : time || initTimeParam) / 60000) % 60)).slice(-2)}:</Text>
                    <Text fontSize={'30px'}>{('0' + Math.floor(((time === 0 ? time : time || initTimeParam) / 1000) % 60)).slice(-2)}:</Text>
                    <Text fontSize={'30px'}>{(time === 0 ? time : time || initTimeParam) % 1000 === 0 ? '00' : ('0' + Math.round(((time === 0 ? time : time || initTimeParam) % 1000) / 10)).slice(-2)}</Text>
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
                            timeRef.current = 0;
                            setTime(0);
                            setMatchFormData((prevState) => ({ ...prevState, climbTime: timeRef.current }));
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
