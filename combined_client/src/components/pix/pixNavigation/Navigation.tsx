import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AdbIcon from '@mui/icons-material/Adb';
import { Link } from 'react-router-dom';
import {useEffect, useState} from "react";
import {Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem} from "@mui/material";
import * as React from "react";
import {Logout, Settings} from "@mui/icons-material";


interface MenuOptions {
  title: string,
  to: string
}

const navMenuOptions: Array<MenuOptions> = [
  {title: "My Projects", to: "/projects"}
]

const NavBar = ({authenticated, clearAuth, userManager}:any) => {
  const [picture,setPicture] = useState<any>("")
  // @ts-ignore
  const [user,setUser] = useState<any>("")
  const [avName,setAvName] = useState<any>("")
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);


  useEffect(() => {
    userManager.getUser().then((res:any)=> {
      if (res) {
        setUser(res);
        if (res.profile.picture) {
          setPicture(res.profile.picture+".jpg");
        }
        setAvName(res.profile.nickname[0].toUpperCase())
      }
    })
  }, [authenticated, userManager])

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateAccount = () => {
    window.location.href = 'http://zitadel.cloud.ut.ee/ui/console/users/me';
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
                {/*<Button*/}
                {/*    key={"logout"}*/}
                {/*    onClick={clearAuth}*/}
                {/*    sx={{mr: 2, my: 2, color: 'white', display: 'block'}}*/}
                {/*>*/}
                {/*  {"Log out"}*/}
                {/*</Button>*/}
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 2 }}

                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar src={picture} sx={{ width: 40, height: 40 }}>{avName}</Avatar>
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    {/*<MenuItem onClick={handleClose}>*/}
                    {/*    <Avatar /> Profile*/}
                    {/*</MenuItem>*/}
                    <MenuItem onClick={handleNavigateAccount}>
                        <ListItemIcon>
                            <Settings fontSize="small" />
                        </ListItemIcon>
                        My account
                    </MenuItem>
                    <Divider />
                    {/*<MenuItem onClick={handleClose}>*/}
                    {/*    <ListItemIcon>*/}
                    {/*        <PersonAdd fontSize="small" />*/}
                    {/*    </ListItemIcon>*/}
                    {/*    Add another account*/}
                    {/*</MenuItem>*/}
                    {/*<MenuItem onClick={handleClose}>*/}
                    {/*    <ListItemIcon>*/}
                    {/*        <Settings fontSize="small" />*/}
                    {/*    </ListItemIcon>*/}
                    {/*    Settings*/}
                    {/*</MenuItem>*/}
                    <MenuItem onClick={clearAuth}>
                        <ListItemIcon>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </Box>}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default NavBar;