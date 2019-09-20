const redisClient = require('../models/redisClient');

// 게임 대기 port 추가
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
};

// 게임 특정 대기 port 삭제
exports.popPort = function(key) {
    return new Promise((resolve, reject)=>{
        redisClient.spop(key, (err, port)=>{
            if(err) {
                reject(err);
            } else {
                resolve(port);
            }
        })
    })
};
