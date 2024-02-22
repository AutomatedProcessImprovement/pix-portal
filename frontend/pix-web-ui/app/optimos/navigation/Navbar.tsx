import * as React from "react";
import { AppBar, Box, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

interface MenuOptions {
  title: string;
  to: string;
}

const menuOptions: MenuOptions[] = [{ title: "Online Schedule Optimizer", to: "/optimizer/upload" }];

const Navbar = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Optimos
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "flex" } }}>
            {menuOptions.map(({ title, to }, index) => (
              <Button
                key={`menu_item_btn_${index}`}
                component={Link}
                to={to}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {title}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
