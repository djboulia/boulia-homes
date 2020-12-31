
'use strict';

module.exports = function (db) {

    this.getAll = function () {
        return db.getAll();
    }

    this.getById = function (id) {
        return db.getById(id);
    }

    this.getByUserid = function (userid) {
        return new Promise((resolve, reject) => {
            db.findFields({ userid: userid })
                .then((results) => {
                    if (results.length > 0) {
                        resolve(results[0]);
                    } else {
                        reject('Userid ' + userid + ' not found');
                    }
                })
                .catch((e) => {
                    reject(e);
                });
        })
    }

    this.authenticate = function (userid, password) {
        const err = 'Invalid userid or password';
        const self = this;

        return new Promise((resolve, reject) => {
            if (!userid || !password) {
                reject(err);
                return;
            }

            self.getByUserid(userid)
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
                    reject(e);
                    return;
                })
        })
    }

};