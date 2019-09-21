const redisClient = require('../models/redisClient');

// 모든 게임 리스트(게임 참가 인원 포함)
exports.getAllData = function(key) {
    return new Promise((resolve, reject) => {
        redisClient.zrevrange(key, 0, -1, "withscores", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
};

// 모든 게임 리스트(게임 코드만)
exports.getAllGame = function(key) {
    return new Promise((resolve, reject) => {
        redisClient.zrevrange(key, 0, -1, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
};

// 특정 게임의 참가 인원 반환 / 특정 게임의 포트 반환
exports.getPeople = function (key, roomCode) {
    return new Promise((resolve, reject) => {
        redisClient.zscan(key, 0, 'MATCH', roomCode, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
};

exports.changePeople = function (key, roomCode, people) {
    return new Promise(((resolve, reject) => {
        redisClient.zincrby(key, people, roomCode, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    }))
};

exports.getWaitGame = function (key, people) {
    return new Promise((resolve, reject) => {
        redisClient.zrevrangebyscore(key, people, people, (err, data)=>{
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
};
