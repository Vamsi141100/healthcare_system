import React from "react";
import { Alert, AlertTitle } from "@mui/material";

const ErrorMessage = ({ message, severity = "error", title = "Error" }) => {
  if (!message) return null;
  return (
    <Alert severity={severity} sx={{ mt: 2, mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      {typeof message === "string" ? message : JSON.stringify(message)}
    </Alert>
  );
};

export default ErrorMessage;