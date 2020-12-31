import React from 'react';
import { Redirect } from 'react-router-dom';
import { LinearProgress } from '@material-ui/core';
import ServerApi from './server/ServerApi';

export default function Logout(props) {
  const [redirectTo, setRedirectTo] = React.useState(undefined);

  // the constructor attempts the logout, so we just redirect back
  // to the main  page in the render function
  const homePage = "/";

  React.useEffect(() => {
    ServerApi.logout()
      .then((result) => {
        console.log("isLoggedIn " + result);
        if (result) {
          setRedirectTo("/");
        } else {
          setRedirectTo("/login");
        }
      });
  }, []);

  if (redirectTo) {
    console.log("Redirecting to " + redirectTo);
    return <Redirect to={redirectTo} />
  }

  return (
    <LinearProgress></LinearProgress>
  )
}
