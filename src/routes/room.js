const express = require('express');
const redisClient = require('../models/redisClient');
const { newRoomCode } = require('../utils/util');
const { getPeople, getWaitGame, getAllGame, getAllData, changePeople, } = require('../utils/redisSortSet');
const { getPort, popPort } = require('../utils/redisSet');

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
    //await redisClient.sadd(roomCode, port);
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
    res.json({roomCode: waitList[0]});
});

router.get('/join/:code', async (req, res, next) => {
    let roomList = await getAllGame('people');
    let roomCode = req.params.code;
    if((roomList.indexOf(roomCode)) === -1) {
        let err = new Error('cannot found room with roomCode');
        err.status = 406;
        next(err);
    } else {
        let people = await getPeople('people', roomCode);
        people = Number(people[1][1]) +1;
        if(people >= 6) {
            let err = new Error('room is full');
            err.status = 403;
            next(err);
        } else {
            await changePeople('people', roomCode, 1);
            res.status(200).json({
                success: true,
                roomCode: roomCode,
                people: people,
            });
        }
    }
});

router.put('/exit/:code', async (req, res, next) => {
   let roomList = await getAllGame('people');
   let roomCode = req.params.code;
    if((roomList.indexOf(roomCode)) === -1) {
        let err = new Error('cannot found room with roomCode');
        err.status = 406;
        next(err);
    }
    let people = await getPeople('people', roomCode);
    people = Number(people[1][1]) - 1;
    if(people < 0) {
        let err = new Error('cannot exit room');
        err.status = 403;
        next(err);
    } else {
        console.log(people);
        await changePeople('people', roomCode, -1);
        res.status(200).json({success: true});
    }
});

router.post('/port', async (req, res, next)=>{
   let port = req.body.port;
   await redisClient.sadd('port', port);
   res.status(201).json({success: true});
});

router.get('/ports', async (req, res, next)=>{
    let ports = await getPort('port');
    res.json({ports: ports});
});

router.get('/rooms', async (req, res, next)=>{
    let roomList = await getAllData('people');
    res.json(roomList);
});

router.delete('/port', async (req, res, next)=>{
    let result = await popPort('port');
    res.json(result);
});

module.exports = router;
