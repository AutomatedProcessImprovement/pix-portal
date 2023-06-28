import { Navigate } from "react-router-dom";
import * as React from "react";
import {Box, Divider, Stack, Typography} from "@mui/material";
import { Link } from 'react-router-dom';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {handleRegister} from "../../api/api";
import CustomButton from "../CustomButton";

const Login = ({ auth, handleLogin, userManager }) => {

  return (
    <div>
      {auth === false && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 20,
          m: 1,
          flexGrow: 1,
          flexDirection: 'column'
        }}>
          <Typography variant={'h3'} sx={{mb: '5%', fontWeight: 'bold' }}>Log in or Sign up</Typography>
          <Stack direction="row" spacing={5}>
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
        </Box>
      )}
      {auth && <Navigate to="/projects" />}
    </div>
  );
};

export default Login;
