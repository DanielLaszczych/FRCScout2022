import React from 'react';
import { useParams } from 'react-router-dom';
import TeamPage from './TeamPage';

function TeamPageHelper() {
    useParams(); //This is necessary because otherwise TeamPage will not refresh on new/same team numbers even if we are passing Date.now in the key

    return <TeamPage key={Date.now()} />;
}

export default TeamPageHelper;
