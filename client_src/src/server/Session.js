/**
 * encapsulates session data for the currently logged in user.  Note that when the session expires
 * the data is reset until the next login.
 */
const Session = {
    storageKey: "session",
  
    /**
     * remove any existing session data
     */
    reset() {
      console.log("session cleared");
      localStorage.removeItem(this.storageKey);
    },
  
    /**
     * set up a new session
     * 
     * @param {String} name human readable name for this user
     * @param {String} username golfer id for this user on the ForeTees site
     * @param {Boolean} admin is this user an admin
     * @param {String} token session token
     * @param {Integer} ttl time to live in millisecs
     */
    create(name, username, admin, token, ttl) {
      const data = {
        name: name,
        username: username,
        admin: admin,
        token: token,
        expires: new Date().getTime() + ttl,
        user: {},
        ttl: ttl
      }
  
      this.setSessionData(data);
      console.log(`token ${token} set`);
    },

    setSessionData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    },

    getSessionData() {
      const str = localStorage.getItem(this.storageKey);
  
      if (str && str != 'undefined') {
        console.log('str: ' + str);

        const data = JSON.parse(str);
  
        if (data && data.expires) {
          // check to see if it's expired
          const now = new Date().getTime();
          console.log(`expires ${data.expires} and now ${now}`);
  
          if (now >= data.expires) {
            // expired, remove the session from storage and return undefined
            console.log("token expired, clearing session");
            this.reset();
          } else {
            // valid session, return it
            return data;
          }
        }
      }
  
      return undefined;
    },

    /**
     * Store custom data for this user.  Will go away when the session expires.
     * 
     * @param {String} key 
     * @param {Object} customData data to store in this session
     */
    setUserData( key, customData ) {
        const data = this.getSessionData();

        if (data) {
            data.user[key] = customData;
            this.setSessionData(data);
        } else {
            // not currently logged in
            console.log("not logged in, custom session data not set")
        }
    },

    /**
     * Get data stored previously in this session.  Goes away when session expires.
     * 
     * @param {String} key 
     */
    getUserData( key ) {
        const data = this.getSessionData();
        let customData = undefined;

        if (data) {
            customData = data.user[key];
        } else {
            // not currently logged in
            console.log("not logged in, custom session data not retrieved")
        }

        return customData;
    },
  
    /**
     * look for a previously stored token in our local storage
     * if we have a valid login, there will be a key there
     * if the key hasn't expired, return the token
     */
    getToken() {
      let token = undefined;
      const data = this.getSessionData();
  
      if (data) {
        token = data.token;
      }
  
      console.log("returning token " + token);
      return token;
    },
  
    getUser() {
      let user = {
        name: undefined,
        username: undefined,
        admin: false
      };
      
      const data = this.getSessionData();
  
      if (data) {
        user.name = data.name;
        user.username = data.username;
        user.admin = data.admin;
      }
  
      console.log("returning user " + JSON.stringify(user));
      return user;
    }
  };

  export default Session;