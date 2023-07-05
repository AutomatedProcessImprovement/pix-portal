import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AdbIcon from '@mui/icons-material/Adb';
import { Link } from 'react-router-dom';
import {useEffect} from "react";


interface MenuOptions {
  title: string,
  to: string
}

const userMenuOptions: Array<MenuOptions> = [
  {title: "Profile", to: "/profile"},
  {title: "Dashboard", to: "/profile/dashboard"},
  {title: "Logout", to: "/logout"},
]

const navMenuOptions: Array<MenuOptions> = [
  {title: "My Projects", to: "/projects"},
]

const NavBar = ({authenticated, userInfo, clearAuth}) => {
  // {isLoggedIn=true}
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null)
  const [isLogged, setIsLogged] = React.useState<Boolean>(false)
  const [userName, setUsername] = React.useState<string | null>(null)

  useEffect(() => {
    if (authenticated && userInfo) {
      setUsername(userInfo.preferred_username)
    }
  }, [authenticated, userInfo])

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };


  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLoginClick = () => {
    handleCloseUserMenu()
    setIsLogged(!isLogged)
  }


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
              href="/home"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Process Improvement eXplorer
            </Typography>
          </Box>
          {!authenticated &&
            <Box sx={{flexGrow: 0, display: {xs: 'none', md: 'flex'}}}>
              <Button
                  key={"login"}
                  href={"/login"}
                  component={'a'}
                  sx={{my: 2, color: 'white', display: 'block'}}
              >
                {"Login"}
              </Button>
            </Box>
          }
          {authenticated &&
            <Box sx={{flexGrow: 0, display: {xs: 'none', md: 'flex'}}}>
              {navMenuOptions.map(({title, to}) => (
                <Button
                  key={title}
                  to={to}
                  component={Link}
                  sx={{my: 2, color: 'white', display: 'block'}}
                >
                  {title}
                </Button>
              ))}
                <Button
                    key={"logout"}
                    onClick={clearAuth}
                    sx={{mr: 2, my: 2, color: 'white', display: 'block'}}
                >
                  {"Log out"}
                </Button>
            </Box>}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default NavBar;