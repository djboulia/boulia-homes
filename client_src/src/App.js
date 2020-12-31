import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import Login from './Login';
import Logout from './Logout';
import Main from './Main';
import ServerApi from './server/ServerApi';

const PrivateRoute = ({
  component: Component,
  ...rest
}) => (

  <Route
    {...rest}
    render={(props) => (ServerApi.isLoggedIn()
    ? <Component {...props}/>
    : <Redirect
      to={{
      pathname: '/login',
      state: {
        from: props.location
      }
    }}/>)}/>

)



export default function App() {
    return (
      <Router>
          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
          <Switch>
            <Route exact path="/login" component={Login} />
            <PrivateRoute exact path="/" component={Main} />
            <PrivateRoute exact path="/logout" component={Logout} />
          </Switch>
      </Router>
    );
}
