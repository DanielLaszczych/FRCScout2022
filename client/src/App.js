import { React, useContext } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthContext } from './context/auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NavbarComponent from './components/NavbarComponent';

function App() {
    const { user } = useContext(AuthContext);
    console.log(user);

    return user ? (
        <ChakraProvider>
            <Router>
                <NavbarComponent />
                <Routes>
                    <Route exact path='/' element={<HomePage />} />
                </Routes>
            </Router>
        </ChakraProvider>
    ) : null;
}

export default App;
