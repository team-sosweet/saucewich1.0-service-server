const redisClient = require('../models/redisClient');

exports.getValue = function (key, field) {
    return new Promise(((resolve, reject) => {
        redisClient.hget(key, field, (err, data) => {
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    }))
};

exports.getAll = function (key) {
    return new Promise(((resolve, reject) => {
        redisClient.hgetall(key, (err, data)=>{
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    }))
};

exports.searchByValue = function (key, match) {
    return new Promise(((resolve, reject) => {
        redisClient.hscan(key, '0', 'MATCH', match, (err, data)=>{
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    }))
};
