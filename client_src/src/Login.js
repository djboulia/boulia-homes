import React from 'react';
import { Redirect } from 'react-router-dom'
import { Button, TextField } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Alert from '@material-ui/lab/Alert';
import Title from './Title';
import ServerApi from './server/ServerApi';

const statusAlert = (msg) => {
  return <Alert severity="info">{msg}</Alert>
}

const errorAlert = (msg) => {
  return <Alert severity="error">{msg}</Alert>
}

export default function Login(props) {
  const [redirectToReferrer, setRedirectToReferrer] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState('Please log in.');
  const [errorMsg, setErrorMsg] = React.useState(undefined);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const loginDisabled = username === "" || password === "";

  const login = function () {
    ServerApi.login(username, password)
      .then((result) => {
        setRedirectToReferrer(true);
      })
      .catch((e) => {
        console.log('Error ' + e.message);
        setErrorMsg(e.message);
      })
  }

  const handleUserNameChange = function (e) {
    setUsername(e.target.value);
  }

  const handlePasswordChange = function (e) {
    setPassword(e.target.value);
  }

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
  }

  const { from } = props.location.state || {
    from: {
      pathname: '/'
    }
  }

  if (redirectToReferrer === true) {
    console.log("Redirecting to : " + from.pathname);
    return <Redirect to={from} />
  }

  const msg = (errorMsg) ? errorAlert(errorMsg) : statusAlert(statusMsg);

  return (
    <Container maxWidth="xs">
      <Title>Login</Title>

      {msg}

      <TextField
        placeholder="E-mail Address"
        margin="normal"
        fullWidth
        label="User Name"
        onChange={handleUserNameChange} />

      <TextField
        type="password"
        label="password"
        margin="normal"
        fullWidth
        onChange={handlePasswordChange}
        onKeyPress={handleEnterKey} />

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

  )
}
