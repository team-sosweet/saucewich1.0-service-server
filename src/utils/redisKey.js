const redisClient = require('../models/redisClient');

// 모든 redis Key 반환
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

exports.getKeyValue = function (key) {
    return new Promise(((resolve, reject) => {
        redisClient.get(key, (err, data)=>{
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    }))
};
