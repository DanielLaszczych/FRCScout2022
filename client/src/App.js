import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/auth';
import HomePage from './pages/HomePage';
import NavbarComponent from './components/NavbarComponent';

function App() {
    return (
        <ChakraProvider>
            <AuthProvider>
                <Router>
                    <NavbarComponent />
                    <Routes>
                        <Route exact path='/' element={<HomePage />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ChakraProvider>
    );
}

export default App;
