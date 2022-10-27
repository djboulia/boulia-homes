
'use strict';

module.exports = function (db) {

    this.findById = function (id) {
        return db.findById(id);
    }

    this.findByIds = function(ids) {
        return db.findByIds(ids);
    }

    this.put = function (id) {
        return db.put(id);
    }

    this.create = function (id) {
        return db.create(id);
    }

};