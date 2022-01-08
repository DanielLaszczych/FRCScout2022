import { React, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth';

import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import { Button, Icon, Input, HStack, Box, Image, Text, Avatar, IconButton, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { BsSearch } from 'react-icons/bs';
import { HamburgerIcon } from '@chakra-ui/icons';
import logo from '../images/TigerOnlyLogo.png';

import '../stylesheets/navbarstyle.css';

function NavbarComponent() {
    let naviagte = useNavigate();
    const { user } = useContext(AuthContext);

    const [dropdown, setDropdown] = useState(false);

    const showDropdown = () => {
        if (window.innerWidth < 730) {
            setDropdown(true);
        } else {
            setDropdown(false);
        }
    };

    useEffect(() => {
        showDropdown();
    }, []);

    window.addEventListener('resize', showDropdown);

    return (
        <Navbar bg='dark' variant='dark' className='pt-3 pb-3'>
            <Box display='flex' marginLeft={'10px'} flexDirection='column' justifyContent='center'>
                <Image
                    w={10}
                    minW={10}
                    src={logo}
                    className='disable-select'
                    onClick={() => naviagte('/')}
                    display='inline-block'
                    _hover={{
                        cursor: 'pointer',
                    }}
                    transition='opacity 0.2s linear'
                    ml='2%'
                />
            </Box>
            <HStack className='searchStack' spacing={0}>
                <Input h='45px' className='search' placeholder='Search team' fontSize='17px' borderRadius={'5px 0px 0px 5px'} bgColor={'white'} _focus={{ boxShadow: 'none' }} />
                <Button h='45px' className='searchButton' _hover={{ bgColor: 'white' }} borderRadius='0px 5px 5px 0px' bgColor={'white'} _focus={{ boxShadow: 'none' }}>
                    <Icon as={BsSearch} boxSize='5' />
                </Button>
            </HStack>
            {dropdown ? (
                <Menu>
                    <MenuButton className='menuButton' as={IconButton} aria-label='Options' icon={<HamburgerIcon />} />
                    <MenuList>
                        <MenuItem>Pits</MenuItem>
                        <MenuItem>Matches</MenuItem>
                        <MenuItem>Analysis</MenuItem>
                    </MenuList>
                </Menu>
            ) : (
                <HStack className='links' marginLeft={'6vw'} spacing={'4vw'}>
                    <Text className='disable-select linkText' color='white' _hover={{ cursor: 'pointer' }} whiteSpace='nowrap' overflow='hidden'>
                        Pits
                    </Text>
                    <Text className='disable-select linkText' color='white' _hover={{ cursor: 'pointer' }} whiteSpace='nowrap' overflow='hidden'>
                        Matches
                    </Text>
                    <Text className='disable-select linkText' color='white' _hover={{ cursor: 'pointer' }} whiteSpace='nowrap' overflow='hidden'>
                        Analysis
                    </Text>
                </HStack>
            )}
            <HStack className='profile'>
                <div className='profileName'>
                    <Text className='disable-select' fontSize='100%' color='white' _hover={{ cursor: 'pointer' }} whiteSpace='nowrap' overflow='hidden'>
                        {' '}
                        {user.firstName}{' '}
                    </Text>
                </div>
                {/* PROFILE PICTURE */}
                <Avatar src={user.iconImage} border='1px solid white' boxSize={10} _hover={{ cursor: 'pointer' }} />
            </HStack>
        </Navbar>
    );
}

export default NavbarComponent;
