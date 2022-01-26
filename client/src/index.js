import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';

import { ColorModeScript } from '@chakra-ui/react';
import theme from './theme';

import { AuthProvider } from './context/auth';

const cache = new InMemoryCache({
    addTypename: false,
});

const client = new ApolloClient({
    uri: '/graphql',
    // Credentials: include is necessary to pass along the auth cookies with each server request
    credentials: 'include',
    cache: cache,
});

ReactDOM.render(
    <React.StrictMode>
        {/* <ColorModeScript /> */}
        <ApolloProvider client={client}>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
