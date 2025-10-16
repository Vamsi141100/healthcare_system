import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import { SnackbarProvider, useSnackbar } from "notistack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import "./index.css";
import CssBaseline from "@mui/material/CssBaseline";

const SnackbarCloseButton = ({ snackbarKey }) => {
  const { closeSnackbar } = useSnackbar();
  return (
    <IconButton
      onClick={() => closeSnackbar(snackbarKey)}
      size="small"
      sx={{ color: "white" }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        autoHideDuration={4000}
        action={(snackbarKey) => (
          <SnackbarCloseButton snackbarKey={snackbarKey} />
        )}
      >
        <CssBaseline />
        <App />
      </SnackbarProvider>
    </Provider>
  </React.StrictMode>
);