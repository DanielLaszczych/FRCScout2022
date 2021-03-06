import { React, useContext } from 'react';
import { ChakraProvider, theme } from '@chakra-ui/react';
import { AuthContext } from './context/auth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PitForm from './pages/PitForm';
import PitPage from './pages/PitsPage';
import AdminPage from './pages/AdminPage';
import MatchesPage from './pages/MatchesPage';
import NotFoundPage from './pages/NotFoundPage';
import PreMatchForm from './pages/PreMatchForm';
import NavBar from './components/NavBar';
import WebDataConnector from './pages/WebDataConnector';
import AdminErrorPage from './pages/AdminErrorPage';
import FailedLoginPage from './pages/FailedLoginPage';
import TeamPageHelper from './pages/TeamPageHelper';
import MatchForm from './pages/MatchForm';
import MatchAnalystPage from './pages/MatchAnalystPage';
import PitMapPage from './pages/PitMapPage';
// import { createBreakpoints } from '@chakra-ui/theme-tools';

// const breakpoints = createBreakpoints({
//     sm: '480px',
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
                <NavBar />
                <Routes>
                    <Route exact path='/' element={<HomePage />} />
                    <Route exact path='/failedLogin' element={<FailedLoginPage />} />
                    <Route exact path='/tableau' element={<WebDataConnector />} />
                    <Route path='*' element={<Navigate replace to='/' />} />
                </Routes>
            </Router>
        </ChakraProvider>
    ) : (
        <ChakraProvider theme={customTheme}>
            <Router>
                <NavBar />
                <Routes>
                    <Route exact path='/' element={<HomePage />} />
                    <Route exact path='/pits' element={<PitPage />} />
                    <Route exact path='matches' element={<MatchesPage />} />
                    <Route exact path='/pitForm/:eventKey/:teamNumber' element={<PitForm />} />
                    <Route exact path='/preMatchForm' element={<PreMatchForm />} />
                    <Route exact path='/matchForm/:eventKey/:matchNumber/:station/:teamNumber' element={<MatchForm />} />
                    <Route exact path='/team/:teamNumber' element={<TeamPageHelper />} />
                    <Route exact path='/matchAnalysis' element={<MatchAnalystPage />} />
                    <Route exact path='/pitMap' element={<PitMapPage />} />
                    <Route exact path='/admin' element={user.admin ? <AdminPage /> : <AdminErrorPage />} />
                    <Route exact path='/tableau' element={<WebDataConnector />} />
                    <Route path='*' element={<NotFoundPage />} />
                </Routes>
            </Router>
        </ChakraProvider>
    );
}

export default App;
