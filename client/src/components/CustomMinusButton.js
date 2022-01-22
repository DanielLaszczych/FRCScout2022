import React from 'react';
import { Box } from '@chakra-ui/react';

import '../stylesheets/custombuttonstyle.css';

function CustomMinusButton({ onClick, fontSize }) {
    return <Box className='minus-button' onClick={() => onClick()} fontSize={fontSize} cursor={'pointer'}></Box>;
}

export default CustomMinusButton;
