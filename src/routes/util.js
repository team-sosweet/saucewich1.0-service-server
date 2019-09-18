const redisClient = require('../models/redisClient');

exports.getAllKeys = function() {
    return new Promise(((resolve, reject) => {
        redisClient.keys('*', (err, keys) => {
            if (err) {
                reject(err);
            } else {
                resolve(keys);
            }
        })
    }))
};

exports.getAllData = function(key) {
    return new Promise((resolve, reject) => {
        redisClient.hgetall(key, (err, data) => {
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
};

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

exports.deleteKey = function(key) {
    return new Promise(((resolve, reject) => {
        redisClient.del(key, (err, data) => {
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    }))
};

exports.newRoomCode = function (length) {
    let result = '';
    let characters = 'abcdefghijklmnopqrstuvwxyz';
    for(i=0; i<length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
