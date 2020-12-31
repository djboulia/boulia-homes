import React from 'react';
import { Redirect } from 'react-router-dom'
import { LinearProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import HomeTabs from './HomeTabs';
import ServerApi from './server/ServerApi';

export default function Main() {
    const [hasLoaded, setHasLoaded] = React.useState(false);
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [errMsg, setErrMsg] = React.useState("");
    const [name, setName] = React.useState("");
    const [homes, setHomes] = React.useState([]);

    React.useEffect(() => {
        const user = ServerApi.getUser();
        setName(user.name);

        ServerApi.homes()
            .then((homes) => {
                setLoggedIn(true);
                setHomes(homes);
                setHasLoaded(true);
            })
            .catch((e) => {
                if (e.code === 401) {
                    setLoggedIn(false);
                    setHasLoaded(true);
                } else {
                    setErrMsg(e.message);
                }
            })
    }, []);

    if (errMsg != "") {
        console.log("Errmsg: " + errMsg);
        return <Alert severity="error">{errMsg}</Alert>
    }

    if (!hasLoaded) {
        return <LinearProgress></LinearProgress>
    }

    if (!loggedIn) {
        return <Redirect to={'/login'} />
    }

    return (
        <HomeTabs homes={homes} />
    );
}