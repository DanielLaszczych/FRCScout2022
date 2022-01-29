import React from 'react';
import { Box } from '@chakra-ui/react';

import '../stylesheets/custombuttonstyle.css';

function CustomPlusButton({ onClick, fontSize }) {
    return <Box className='plus-button' onClick={() => onClick()} fontSize={fontSize} cursor={'pointer'}></Box>;
}

export default CustomPlusButton;
