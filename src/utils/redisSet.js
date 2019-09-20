const redisClient = require('../models/redisClient');

exports.getPort = function (key) {
    return new Promise(((resolve, reject) => {
        redisClient.smembers(key, (err, set)=>{
            if(err) {
                reject(err);
            } else {
                resolve(set);
            }
        })
    }))
}

exports.popPort = function(key, port) {
    return new Promise((resolve, reject)=>{
        redisClient.srem(key, port, (err, set)=>{
            if(err) {
                reject(err);
            } else {
                resolve(set);
            }
        })
    })
}
