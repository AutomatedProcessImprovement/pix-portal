import { useEffect } from 'react';
import {authConfig} from '../../../../authConfig';
import {Navigate} from "react-router-dom"
import {Box, CircularProgress, Typography} from "@mui/material";

const Callback = ({ auth, setAuth, userManager, userInfo, setUserInfo }:any) => {
  useEffect(() => {
    if (auth === null) {
      console.log("doing effect")
      userManager.signinRedirectCallback().then((user:any) => {
        if (user) {

          setAuth(true);
          const access_token = user.access_token;
          // Make a request to the user info endpoint using the access token
          fetch(authConfig.userinfo_endpoint, {
            headers: {
              'Authorization': `Bearer ${access_token}`
            }
          })
            .then(response => response.json())
            .then(userInfo => {
              setUserInfo(userInfo);
            });
        } else {
          setAuth(false);
        }
      }).catch((error:any) => {
        console.log(error)
        setAuth(false);
      });
    }
  }, [auth, userManager, setAuth]);


  if (auth === true && userInfo) {
    return (
      <Navigate to="/projects" replace/>
    );
  }
  else {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        mt: 1
      }}>
        <Box
          sx={{
            p: 1,
            m: 1,
          }}>
        <CircularProgress />
        </Box>
        <Box
          sx={{
            p: 1,
            m: 1,
          }}>
          <Typography
            variant="body1"
          >
            Loading
          </Typography>
        </Box>
    </Box>);
  }

};

export default Callback;

