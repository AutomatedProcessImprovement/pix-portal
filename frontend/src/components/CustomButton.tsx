import * as React from "react";
import {Button, Typography} from "@mui/material";
import { buttonClasses } from '@mui/base/Button';
import { styled } from '@mui/system';
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

export default CustomButton