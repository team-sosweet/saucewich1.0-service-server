const redisClient = require('../models/redisClient');
const jwt = require('jsonwebtoken');

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

// 특정 게임의 참가 인원 반환
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

exports.maxExp = function (level) {
    let max_exp = 0;
    if(Number(level) === 1) max_exp = 1000;
    else {
        max_exp = Math.floor(1000 * (1.5 ** (Number(level)-1)));
    }
    return max_exp;
};

exports.checkJWT = function (req, res, next) {
    const token = req.get(`X-Access-Token`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(req.body.id === decoded.id) {
        next();
    } else {
        let err = new Error('user authentication fail');
        err.status = 401;
        next(err);
    }
};

exports.addPlaytime = function (source, target) {
    let sourceTime = source.split(':');
    let targetTime = target.split(':');
    let second = Number(sourceTime[2]) + Number(targetTime[2]);
    let minute = Number(sourceTime[1]) + Number(targetTime[1]);
    let hour = Number(sourceTime[0]) + Number(targetTime[0]);
    if(second >= 60) {
        second -= 60;
        minute ++;
    }
    if(second < 10) {
        second = '0'+second.toString();
    }
    if(minute < 10) {
        minute = '0'+minute.toString();
    }
    if(hour < 10) {
        hour = '0'+hour.toString();
    }
    if(minute >= 60) {
        minute -= 60;
        hour ++;
    }
    return hour.toString() + ':' + minute.toString() + ':' + second.toString();
};
