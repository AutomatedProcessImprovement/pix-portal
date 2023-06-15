import {Box, Button, Fade, List, ListItem, Typography} from "@mui/material";
import { buttonClasses } from '@mui/base/Button';
import { styled } from '@mui/system';
import * as React from "react";
import {Link} from "react-router-dom";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
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


const Index = () => {

  const [isVisible, setIsVisible] = React.useState<Boolean>(true)
  const [isVisible2, setIsVisible2] = React.useState<Boolean>(false)

  return(
    <>
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 20,
        m: 1,
        flexGrow: 1,
        flexDirection: 'column'
      }}>
        <Fade in={isVisible} appear={true} timeout={1500} >
        <Typography
          variant="h3"
          noWrap
          component="a"
          href="/"
          sx={{
            mb: 4,
            display: { xs: 'none', md: 'flex' },
            fontWeight: 700,
            letterSpacing: '.2rem',
            color: 'text.primary',
            textDecoration: 'none',
          }}
        >
          # Process Improvement eXplorer #
        </Typography>
        </Fade>
        <Fade in={isVisible} appear={true} timeout={2500} addEndListener={() => setTimeout(()=> {
          setIsVisible2(true)
        }, 1000)}>

          <CustomButton
            key={"get-started"}
            to={"/my/projects"}
            component={Link}

            sx={{ minWidth: '400px', minHeight: '50px', mb: 4}}
            endIcon={<ArrowForwardIosIcon />}
          >
            <Typography
              variant="h6"
            >
              Get Started
            </Typography>

          </CustomButton>
        </Fade>

        <Fade in={isVisible2} appear={false}
              timeout={2500}>
          <List sx={{
              mb: 4,}}>
            <ListItem>
              <Typography
                variant="h4"
                noWrap
                component="a"
                href="/"
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
                component="a"
                href="/"
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  fontWeight: 700,
                  letterSpacing: '.2rem',
                  color: 'text.primary',
                  textDecoration: 'none',
                }}
              >
                File uploading
              </Typography>
            </ListItem>
            <ListItem>
              <Typography
                variant="h4"
                noWrap
                component="a"
                href="/"
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  fontWeight: 700,
                  letterSpacing: '.2rem',
                  color: 'text.primary',
                  textDecoration: 'none',
                }}
              >
                More...
              </Typography>
            </ListItem>

          </List>

        </Fade>
      </Box>
    </>
  )
}

export default Index;