import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import {Link} from "@mui/material";

interface MenuOptions {
  title: string,
  to: string
}

const userMenuOptions: Array<MenuOptions> = [
  {title: "Profile", to: "/profile"},
  {title: "Dashboard", to: "/dashboard"},
  {title: "Logout", to: "/logout"},
]

const navMenuOptions: Array<MenuOptions> = [
  {title: "My Projects", to: "/projects"},
]

const NavBar = ({isLoggedIn=true}) => {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };


  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // noinspection TypeScriptValidateTypes
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}}}>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Process Improvement eXplorer
            </Typography>
          </Box>
          {!isLoggedIn &&
              <Box sx={{flexGrow: 0, display: {xs: 'none', md: 'flex'}}}>
                  <Button
                    key={"login"}
                    to={"/login"}
                    // onClick={handleCloseNavMenu}
                    sx={{my: 2, color: 'white', display: 'block'}}
                  >
                    {"Login"}
                  </Button>
              </Box>
          }
          {isLoggedIn &&
              <Box sx={{flexGrow: 0, display: {xs: 'none', md: 'flex'}}}>
                {navMenuOptions.map(({title, to}) => (
                  <Button
                    key={title}
                    to={to}
                    sx={{mr: 5, my: 2, color: 'white', display: 'block'}}
                  >
                    {title}
                  </Button>
                ))}
                <IconButton onClick={handleOpenUserMenu} sx={{p: 0, mr: 4}}>
                    <Avatar alt="Remy Sharp" src="/public/2.jpg"/>
                </IconButton>
                <Menu
                    sx={{mt: '45px'}}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                >
                  {userMenuOptions.map(({title, to}) => (
                    <MenuItem component={Link} key={title} to={to}>
                      <Typography textAlign="center">{title}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
          }
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default NavBar;