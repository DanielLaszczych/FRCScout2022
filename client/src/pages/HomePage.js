import { React, useContext } from 'react';
import { AuthContext } from '../context/auth';
import { config } from '../util/constants';
import { Button, Center, VStack, Image } from '@chakra-ui/react';

function HomePage() {
    const { user } = useContext(AuthContext);

    return (
        <Center marginTop={'100px'}>
            <VStack spacing={'25px'}>
                <div>{user.displayName}</div>
                <Image src={user.iconImage}></Image>

                <div>
                    {user === 'NoUser' ? (
                        <a href={`${config.API_URL}/auth/google`}>
                            <Button>Login with Google</Button>
                        </a>
                    ) : (
                        <a href={`${config.API_URL}/auth/logout`}>
                            <Button>Logout</Button>
                        </a>
                    )}
                </div>
            </VStack>
        </Center>
    );
}

export default HomePage;
