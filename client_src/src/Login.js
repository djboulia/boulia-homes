import React from "react";
import { Redirect } from "react-router-dom";
import { Button, TextField } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Alert from "@material-ui/lab/Alert";
import Title from "./Title";
import ServerApi from "./server/ServerApi";

const statusAlert = (msg) => {
  return <Alert severity="info">{msg}</Alert>;
};

const errorAlert = (msg) => {
  return <Alert severity="error">{msg}</Alert>;
};

export default function Login(props) {
  const [redirectToReferrer, setRedirectToReferrer] = React.useState(false);
  const [statusMsg] = React.useState("Please log in.");
  const [errorMsg, setErrorMsg] = React.useState(undefined);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const loginDisabled = username === "" || password === "";

  const LOGOUT_DURATION = 5 * 60 * 1000; // 5 minutes
  let logoutTimeout = null;

  const logout = function () {
    console.log("timer expired... logging out");

    ServerApi.logout()
      .then(() => {
        console.log("logout complete, redirecting to /login page");

        window.location.reload();
      })
      .catch((e) => {
        console.log("Error " + e.message);

        window.location.reload();
      });
  };

  const cancelTimer = function () {
    if (logoutTimeout) clearTimeout(logoutTimeout);
  };

  const startTimer = function () {
    logoutTimeout = setTimeout(logout, LOGOUT_DURATION);
  };

  const resetTimer = function () {
    cancelTimer();
    startTimer();
  };

  const login = function () {
    ServerApi.login(username, password)
      .then((result) => {
        setRedirectToReferrer(true);

        // after successful login, set a timer to auto-logout
        // after a set interval
        resetTimer();
      })
      .catch((e) => {
        console.log("Error " + e.message);
        setErrorMsg(e.message);
      });
  };

  const handleUserNameChange = function (e) {
    setUsername(e.target.value);
  };

  const handlePasswordChange = function (e) {
    setPassword(e.target.value);
  };

  /**
   * as a convenience, we start the login process
   * if someone presses enter from the password field.
   *
   * @param {Object} e key event
   */
  const handleEnterKey = function (e) {
    if (e.key === "Enter") {
      login();
    }
  };

  const { from } = props.location.state || {
    from: {
      pathname: "/",
    },
  };

  if (redirectToReferrer === true) {
    console.log("Redirecting to : " + from.pathname);
    return <Redirect to={from} />;
  }

  const msg = errorMsg ? errorAlert(errorMsg) : statusAlert(statusMsg);

  return (
    <Container maxWidth="xs">
      <Title>Login</Title>

      {msg}

      <TextField
        placeholder="E-mail Address"
        margin="normal"
        fullWidth
        label="User Name"
        onChange={handleUserNameChange}
      />

      <TextField
        type="password"
        label="password"
        margin="normal"
        fullWidth
        onChange={handlePasswordChange}
        onKeyPress={handleEnterKey}
      />

      <Button
        fullWidth
        variant="contained"
        disabled={loginDisabled}
        color="primary"
        onClick={login}
      >
        Log In
      </Button>
    </Container>
  );
}
