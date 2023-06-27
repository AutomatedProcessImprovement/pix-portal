import { Navigate } from "react-router-dom";
import * as React from "react";
import {Box, Button, Fade, List, ListItem, Typography} from "@mui/material";
import { buttonClasses } from '@mui/base/Button';
import { styled } from '@mui/system';
import {Link} from "react-router-dom";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {handleRegister} from "../../api/api";
const blue = {
  500: '#007FFF',
  600: '#0072E5',
  700: '#0059B2',
};

const grey = {
  100: '#eaeef2',
  300: '#afb8c1',
  900: '#24292f',
};

const CustomButton = styled(Button)(
  ({ theme }) => `
  font-family: Segoe UI, sans-serif
  font-weight: bold;
  font-size: 17px;
  background-color: ${blue[500]};
  padding: 12px 24px;
  border-radius: 50px;
  color: white;
  transition: all 150ms ease;
  cursor: pointer;
  border: none;
  minWidth: '400px';
  minHeight: '50px';

  &:hover {
    background-color: ${blue[600]};
  }

  &.${buttonClasses.active} {
    background-color: ${blue[700]};
  }

  &.${buttonClasses.focusVisible} {
    box-shadow: 0 3px 20px 0 rgba(61, 71, 82, 0.1), 0 0 0 5px rgba(0, 127, 255, 0.5);
    outline: none;
  }

  &.${buttonClasses.disabled} {
    opacity: 0.5;
    cursor: not-allowed;
  }
  `,
);

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
          <h1>LOGIN!</h1>

          <CustomButton
            key={"login-button"}
            onClick={() => {
              // Perform the authorization request, including the code challenge
              // const res1 = handleRegister("test1", "T", "W", "test@email.com")
              // res1.then((rr)=>{
              //   console.log(rr)
              // })

              handleLogin();
            }}

            sx={{ minWidth: '400px', minHeight: '50px', mb: 4}}
            endIcon={<ArrowForwardIosIcon />}
          >
            <Typography
              variant="h6"
            >
              Log in
            </Typography>

          </CustomButton>
        </Box>
      )}
      {auth && <Navigate to="/projects" />}
    </div>
  );
};

export default Login;
