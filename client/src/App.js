import { React, useContext } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthContext } from './context/auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NavbarComponent from './components/NavbarComponent';
import PitForm from './pages/PitForm';
import PitPage from './pages/PitsPage';
import AdminPage from './pages/AdminPage';

function App() {
    const { user } = useContext(AuthContext);
    console.log(user);

    return user === null ? null : user === 'NoUser' ? (
        <ChakraProvider>
            <Router>
                <NavbarComponent />
                <HomePage />
            </Router>
        </ChakraProvider>
    ) : (
        <ChakraProvider>
            <Router>
                <NavbarComponent />
                <Routes>
                    <Route exact path='/' element={<HomePage />} />
                    <Route exact path='/pits' element={<PitPage />} />
                    <Route exact path='/pitform/:event/:team' element={<PitForm />} />
                    <Route exact path='/admin' element={<AdminPage />} />
                </Routes>
            </Router>
        </ChakraProvider>
    );
}

export default App;
