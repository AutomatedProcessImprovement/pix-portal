import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

interface MenuOptions {
    title: string,
    to: string
}

const menuOptions: Array<MenuOptions> =
    [
        { title: "Online Business Process Simulator", to: "/simulator/upload" }
    ]

const Navbar = () => {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                    >
                        Prosimos
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex' } }}>
                        {menuOptions.map(({ title, to }, index) => (
                            <Button
                                key={`menu_item_btn_${index}`}
                                component={Link}
                                to={to}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                {title}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default Navbar;
