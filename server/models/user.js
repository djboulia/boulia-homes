
const User = function (model) {

    const findByUserid = function (userid) {

        console.log('looking for userid "'+ userid +'"');

        return new Promise((resolve, reject) => {
            model.findByFields({ userid: userid })
                .then((results) => {
                    if (results.length > 0) {
                        resolve(results[0]);
                    } else {
                        reject(`Userid ${userid} not found`);
                    }
                })
                .catch((e) => {
                    reject(e);
                });
        })
    }

    const authenticate = function (userid, password) {
        const err = 'Invalid userid or password';
        const self = this;

        return new Promise((resolve, reject) => {
            if (!userid || !password) {
                reject(err);
                return;
            }

            findByUserid(userid)
                .then((player) => {
                    if (player.password !== password) {
                        reject(err);
                        return;
                    }

                    player.password = undefined;
                    player.token = 'Dummy_Token';
                    player.ttl = 3600 * 1000;       // 1 hour

                    resolve(player);
                })
                .catch((e) => {
                    console.log('findByUserid failed ', e);
                    reject(e);
                    return;
                })
        })
    }

    // handlers for our backend API entry points
    model.login = async function (session, credentials) {

        // login attempt resets session data
        session.user = undefined;

        // for now, just return a positive response if there is any user/pass given
        const userid = credentials.userid;
        const password = credentials.password;

        const result = await authenticate(userid, password)
            .catch((err) => {
                throw new Error(err);
            });

        session.user = result;

        return {
            user: result
        };
    }

    model.logout = async function (session) {
        console.log("logout ");

        // reset the user data for this session
        session.user = undefined;

        return {
            message: 'Logged out.'
        };
    }

    model.currentUser = async function(session) {
        console.log('currentUser: found user', session.user);
        if (session.user) {
            return session.user;
        } else {
            return undefined;
        }
    }

    /**
     * define a pass through auth function for methods that can be called with
     * no authenticated user. (e.g. login, currentUser)
     * 
     * @param {Object} context 
     */
    const noAuth = async function (context) {
        return true;
    }

    // add our additional entry points here
    // order is important since this is how the methods will be displayed
    // in the API explorer, so we add the login method first

    model.method(
        '/login',
        'POST',
        {
            description: "Log in this User",
            responses: [
                {
                    code: 200,
                    description: "Successful login returns this user's record"
                },
                {
                    code: 500,
                    description: "Invalid log in"
                }
            ],
            params: [
                {
                    name: 'session',
                    source: 'session',
                    type: 'object'
                },
                {
                    name: 'credentials',
                    source: 'body',
                    type: 'object',
                    schema: {
                        "name": 'credentials',
                        "properties": {
                            "userid": {
                                "required": true,
                                "type": 'string'
                            },
                            "password": {
                                "required": true,
                                "type": 'string'
                            }
                        }
                    }
                }
            ]
        },
        model.login,
        noAuth
    );

    model.method(
        '/logout',
        'POST',
        {
            description: "Log out in this User",
            responses: [
                {
                    code: 200,
                    description: "Successful logout of this User"
                },
                {
                    code: 500,
                    description: "Invalid log out"
                }
            ],
            params: [
                {
                    name: 'session',
                    source: 'session',
                    type: 'object'
                }
            ]
        },
        model.logout,
        noAuth
    );

    // expose the create, read, update methods from this model
    model.addCrudMethods();
};

module.exports = User;