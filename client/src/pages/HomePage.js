import { React, useContext } from 'react';
import { AuthContext } from '../context/auth';
import { config } from '../util/constants';
import { Image } from '@chakra-ui/react';

function HomePage() {
    const { user } = useContext(AuthContext);

    return user ? (
        <div>
            <div>{user.displayName}</div>
            <Image src={user.iconImage}></Image>

            {user === 'NoUser' ? (
                <a href={`${config.API_URL}/auth/google`}>
                    <button>Login with Google</button>
                </a>
            ) : (
                <a href={`${config.API_URL}/auth/logout`}>
                    <button>Logout</button>
                </a>
            )}
        </div>
    ) : null;
}

export default HomePage;
