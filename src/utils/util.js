const jwt = require('jsonwebtoken');

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
