import { Box, Button, VStack } from '@chakra-ui/react';
import React from 'react';
import { config } from '../util/constants';

function FailedLoginPage() {
    return (
        <VStack>
            <Box textAlign={'center'} fontSize={'25px'} fontWeight={'medium'} margin={'0 auto'} width={{ base: '85%', md: '66%', lg: '50%' }}>
                Please sign in with a RoboTigers account
            </Box>
            <a style={{ marginTop: '25px' }} href={`${config.API_URL}/auth/google`}>
                <Button _hover={{ textColor: '#1A202C', backgroundColor: 'gray.200' }} _focus={{ outline: 'none' }}>
                    Login with Google
                </Button>
            </a>
        </VStack>
    );
}

export default FailedLoginPage;
