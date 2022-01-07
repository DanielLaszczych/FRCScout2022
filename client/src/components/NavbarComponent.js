import { React } from 'react';

import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

function NavbarComponent() {
    return (
        <Navbar bg='dark' variant='dark' className='pt-3 pb-3'>
            {/* <Container className='m-0 w-100'> */}
            <Navbar.Brand href='#home' className=''>
                RoboTigers Scouter
            </Navbar.Brand>
            <Form className='d-flex' style={{ width: '30vw' }}>
                <FormControl type='search' placeholder='Search' className='' aria-label='Search' />
                <Button variant='outline-success'>Search</Button>
            </Form>
            <Nav className='position-absolute end-0'>
                <Nav.Link href='#home'>Home</Nav.Link>
                <Nav.Link href='#features'>Pit</Nav.Link>
                <Nav.Link href='#pricing'>Match</Nav.Link>
            </Nav>
            {/* </Container> */}
        </Navbar>
    );
}

export default NavbarComponent;
