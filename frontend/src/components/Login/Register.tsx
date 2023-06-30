import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {handleRegister} from "../../api/api";
import {CircularProgress} from "@mui/material";
import {blue} from "@mui/material/colors";
import {OTPDialog} from "../CustomComponents/OTPDialog";
import paths from "../../router/paths";
import CustomButton from "../CustomComponents/CustomButton";
import {useNavigate} from 'react-router-dom';


const Register = () => {
  const [loading, setLoading] = React.useState(false);
  const [otp, setOTP] = React.useState(null)
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleClose = (value: string) => {
    setOpen(false);
    navigate(
      paths.LOGIN_PATH
    )
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loading) {
      setLoading(true)
      const data = new FormData(event.currentTarget);
      console.log({
        username: data.get('username'),
        firstname: data.get('firstName'),
        lastname: data.get('lastName'),
        email: data.get('email'),
      });
      console.log(data)

      handleRegister(data.get('username'), data.get('firstName'), data.get('lastName'), data.get('email')).then((res) => {
        setLoading(false)
        setOTP(res.data.otp)
        setOpen(true)

      }).catch((e) => {
        setLoading(false)
      })

    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <OTPDialog
        selectedValue={otp}
        open={open}
        onClose={handleClose}
      />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete="given-name"
                name="firstName"
                required
                fullWidth
                id="firstName"
                label="First Name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
              />
            </Grid>
              <Grid item xs={12}>
                <Typography
                variant={'caption'}
                >
                  You will receive a one-time password. Please change your password on the first login.
                </Typography>
            </Grid>
          </Grid>
          <Box sx={{ m: 1, position: 'relative' }}>
          <CustomButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </CustomButton>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                color: blue[500],
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
          </Box>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href={paths.LOGIN_PATH} variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
