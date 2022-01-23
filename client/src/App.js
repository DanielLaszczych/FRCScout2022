import { React, useContext } from 'react';
import { Center, ChakraProvider, theme } from '@chakra-ui/react';
import { AuthContext } from './context/auth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NavbarComponent from './components/NavbarComponent';
import PitForm from './pages/PitForm';
import PitPage from './pages/PitsPage';
import AdminPage from './pages/AdminPage';
import MatchForm from './pages/MatchForm';
import MatchesPage from './pages/MatchesPage';
import NotFoundPage from './pages/NotFoundPage';
import PreMatchForm from './pages/PreMatchForm';
// import { createBreakpoints } from '@chakra-ui/theme-tools';

// const breakpoints = createBreakpoints({
//     sm: '320px',
//     md: '768px',
//     lg: '992px',
//     xl: '1200px',
//     '2xl': '1536px',
// });

const customTheme = {
    ...theme,
};

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
        <ChakraProvider theme={customTheme}>
            <Router>
                <NavbarComponent />
                <Routes>
                    <Route exact path='/' element={<HomePage />} />
                    <Route exact path='/pits' element={<PitPage />} />
                    <Route exact path='matches' element={<MatchesPage />} />
                    <Route exact path='/pitForm/:eventKey/:teamNumber' element={<PitForm />} />
                    <Route exact path='/preMatchForm' element={<PreMatchForm />} />
                    <Route exact path='/matchForm/:eventKey/:matchNumber/:station' element={<MatchForm />} />
                    <Route exact path='/admin' element={user.admin ? <AdminPage /> : <Center>You must be an admin</Center>} />
                    <Route path='*' element={<NotFoundPage />} />
                </Routes>
            </Router>
        </ChakraProvider>
    );
}

export default App;
