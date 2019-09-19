const express = require('express');
const redisClient = require('../models/redisClient');
const { getAllKeys, getWaitGame, getAllGame, getAllData, getValue, deleteKey, newRoomCode, getPeople } = require('./util');

let router = express.Router();

router.post('/', async (req, res, next) => {
    let roomList = await getAllGame('people');
    let allow = false;
    let roomCode = '';
    while(allow === false) {
        roomCode = newRoomCode(3);
        console.log(roomList);
        if((roomList.indexOf(roomCode)) === -1) {
            allow = true;
        }
    }
    await redisClient.zadd("people", 0, roomCode);
    let result = await getPeople('people', roomCode);
    if(result) res.json({roomCode:roomCode, people:result[0][0]});
});

router.get('/join/rand', async (req, res, next) => {
    let waitList = [];
    let num = 5;
    while(!waitList[0]) {
        waitList = await getWaitGame('people', num);
        num--;
    }
    res.json(waitList[0]);
});

router.get('/join/:code', async (req, res, next) => {
    let roomList = await getAllKeys();
    let roomCode = req.params.code;
    if((roomList.indexOf(roomCode)) === -1) {
        let err = new Error('cannot found room with roomCode');
        err.status = 406;
        next(err);
    } else {
        let people = await getValue(roomCode, 'people');
        console.log(Number(people));
        if(people >= 6) {
            let err = new Error('room is full');
            err.status = 403;
            next(err);
        } else {
            let result = await redisClient.hmset(roomCode, {people:Number(people)+1});
            res.status(200).json({
                success: true,
                roomCode: roomCode,
                people: Number(people)+1,
            });
        }
    }
});

router.put('/exit/:code', async (req, res, next) => {
   let roomList = await getAllKeys();
   let roomCode = req.params.code;
    if((roomList.indexOf(roomCode)) === -1) {
        //error 처리
        res.json('test');
    }
    let people = await getValue(roomCode, 'people');
    if(people <= 1) {
        let result = await deleteKey(roomCode);
        if(result) res.status(200).json({success: true, message: '방에 인원이 없어 제거되었습니다.'});
    } else {
        let result = await redisClient.hmset(roomCode, {people:Number(people)-1});
        res.json(result);
    }
});

router.get('/keys', async (req, res, next)=>{
    let roomList = await getAllKeys();
    res.json(roomList);
});

module.exports = router;
