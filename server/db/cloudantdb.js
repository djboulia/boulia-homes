/**
 * Cloudant front end to abstract the db details
 * 
 * @param {Object} cloudant configured Cloudant object
 * @param {String} dbName database name to use
 */

const findById = function (id, records) {
    for (let i = 0; i < records.length; i++) {
        const record = records[i];

        if (record._id === id) {
            return record;
        }
    }

    console.log('Error: could not find id ' + id);
    console.log('Records:  ', records);
    return undefined;
}

const CloudantDB = function (cloudant, dbName, className) {
    const db = cloudant.db.use(dbName)

    this.findFields = function (fields) {
        return new Promise((resolve, reject) => {
            fields.class = className;

            db.find({ selector: fields }, function (err, result) {
                if (err) {
                    console.log('db.find error: ', err);
                    reject(err);
                    return;
                }

                console.log('Found documents with id ');
                for (var i = 0; i < result.docs.length; i++) {
                    console.log('  Doc id: %s', result.docs[i]._id);
                }

                resolve(result.docs);
            });
        });
    }

    this.getById = function (id) {
        return new Promise((resolve, reject) => {
            db.find({ selector: { _id: id } }, function (err, result) {
                if (err) {
                    reject(err);
                    return;
                }

                if (result.docs.length != 1) {
                    const msg = 'Warning! unexpected document length ' + result.docs.length;
                    console.log(msg);
                    reject(msg);
                    return;
                }

                for (var i = 0; i < result.docs.length; i++) {
                    console.log('  Doc id: %s', result.docs[i]._id);
                }

                resolve(result.docs[0]);
            });
        })
    }

    this.getAll = function () {
        return new Promise((resolve, reject) => {
            db.find({ selector: { class: className } }, function (err, result) {
                if (err) {
                    reject(err);
                    return;
                }

                console.log('getAll: Found ' + result.docs.length + ' documents');
                for (var i = 0; i < result.docs.length; i++) {
                    console.log('  Doc id: %s', result.docs[i]._id);
                }

                resolve(result.docs);
            });
        })
    }

    this.update = function (record) {
        return new Promise((resolve, reject) => {

            if (!record._rev) {
                reject('did not find a _rev attribute');
                return;
            }

            console.log('record has _rev ' + record._rev);

            db.insert(record)
                .then((result) => {
                    if (result.ok) {
                        record._id = result.id;
                        record._rev = result.rev;
                        resolve(record);
                    } else {
                        reject(result.ok);
                    }
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    /**
     * Get multiple records by id in one call
     * 
     * @param {Array} ids an array of ids to search for
     */
    this.getIds = function (ids) {
        const self = this;

        return new Promise((resolve, reject) => {
            self.getAll()
                .then((records) => {
                    const results = [];

                    for (let i = 0; i < ids.length; i++) {
                        const id = ids[i];

                        const record = findById(id, records);
                        results.push(record);
                    }

                    resolve(results);
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

    this.create = function (record) {
        return new Promise((resolve, reject) => {

            record.class = className;

            db.insert(record)
                .then((result) => {
                    if (result.ok) {
                        record._id = result.id;
                        record._rev = result.rev;
                        resolve(record);
                    } else {
                        reject(result.ok);
                    }
                })
                .catch((e) => {
                    reject(e);
                })
        })
    }

};

module.exports = CloudantDB;