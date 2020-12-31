
'use strict';

module.exports = function (db) {

    this.getById = function (id) {
        return db.getById(id);
    }

    this.getIds = function(ids) {
        return db.getIds(ids);
    }

    this.update = function (id) {
        return db.update(id);
    }

    this.create = function (id) {
        return db.create(id);
    }

};