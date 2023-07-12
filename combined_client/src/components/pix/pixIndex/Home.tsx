import {Box, Divider, List, ListItem, Stack, Typography} from "@mui/material";
import * as React from "react";
import {Link} from "react-router-dom";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CustomButton from "../pixCustomButton/CustomButton";
import { Navigate } from "react-router-dom";

const Home = ({ auth, handleLogin }:any) => {

  return(
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      p: 20,
      m: 1,
      flexGrow: 1,
      flexDirection: 'column'
    }}>
      {/*<Fade in={isVisible} appear={true} timeout={1500} addEndListener={() => setTimeout(()=> {*/}
      {/*  setIsVisible2(true)*/}
      {/*}, 1000)}>*/}
        <Typography variant={'h3'} sx={{mb: 4, fontWeight: 'bold' }}># Process Improvement eXplorer #</Typography>
      {/*</Fade>*/}
      {/*<Fade in={isVisible} appear={true} timeout={1500}>*/}
        {auth === false && (
            <Stack direction="row" spacing={5} sx={{mb:3}}>
              <Divider orientation="vertical" flexItem />
              <CustomButton
                key={"login-button"}
                onClick={() => {
                  handleLogin();
                }}

                sx={{ minWidth: '400px', minHeight: '50px'}}
                endIcon={<ArrowForwardIosIcon />}
              >
                <Typography
                  variant="h6"
                >
                  Log in
                </Typography>

              </CustomButton>
              <CustomButton
                key={"signup-button"}
                // @ts-ignore
                to={"/signup"}
                component={Link}
                sx={{ minWidth: '400px', minHeight: '50px'}}
                endIcon={<ArrowForwardIosIcon />}
              >
                <Typography
                  variant="h6"
                >
                  Sign up
                </Typography>
              </CustomButton>
              <Divider orientation="vertical" flexItem />
            </Stack>
        )}
        {auth && <Navigate to="/projects" />}
      {/*</Fade>*/}
      {/*<Fade in={isVisible2} appear={false}*/}
      {/*      timeout={2500}>*/}
        <List sx={{
            mb: 4,}}>
          <ListItem>
            <Typography
              variant="h4"
              noWrap
              sx={{
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'text.primary',
                textDecoration: 'none',
              }}
            >
              Project Management
            </Typography>
          </ListItem>
          <ListItem>
            <Typography
              variant="h4"
              noWrap
              sx={{
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'text.primary',
                textDecoration: 'none',
              }}
            >
              Discovery
            </Typography>
          </ListItem>
          <ListItem>
            <Typography
              variant="h4"
              noWrap
              sx={{
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'text.primary',
                textDecoration: 'none',
              }}
            >
              Simulation
            </Typography>
          </ListItem>
          <ListItem>
            <Typography
              variant="h4"
              noWrap
              sx={{
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'text.primary',
                textDecoration: 'none',
              }}
            >
              Optimization
            </Typography>
          </ListItem>
        </List>
      {/*</Fade>*/}
    </Box>
  )
}

export default Home;