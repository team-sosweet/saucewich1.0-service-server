const express = require('express');
const redisClient = require('../models/redisClient');
const { newRoomCode, requestProcess } = require('../utils/util');
const { getPeople, getWaitGame, getAllGame, getAllData, changePeople, } = require('../utils/redisSortSet');
const { getPort, popPort } = require('../utils/redisSet');
const { getValue, searchByValue, getAll } = require('../utils/redisHash');
const { deleteKey } = require('../utils/redisKey');

let router = express.Router();

// deprecated , join API 에서 방이 없다면 방 생성함.
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
    const port = await popPort('port');
    if(port === null) {
        res.json({success: false});
    } else {
        await redisClient.hset('ports', roomCode, port);
        const result = await getValue('ports', roomCode);
        let people = await getPeople('people', roomCode);
        if(people) res.json({roomCode:roomCode, people:people[0][0], port: result.toString()});
    }
});

router.get('/join/rand', async (req, res, next) => {
    let waitList = [];
    let num = 5;
    let flag = false;
    while(!waitList[0]) {
        waitList = await getWaitGame('people', num);
        num--;
        if(num === -1) {
            flag = true;
            break;
        }
    }
    if(flag) {
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
        const port = await popPort('port');
        if(port === null) {
            await requestProcess();
            res.json({success: false});
        } else {
            await redisClient.zadd("people", 0, roomCode);
            await redisClient.hset('ports', roomCode, port);
            res.json({roomCode:roomCode});
        }
    } else {
        res.json({roomCode: waitList[0]});
    }
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
        // people = Number(people[1][1]) +1;
        let port = await getValue('ports', roomCode);
        if(port === null) {
            res.json({success: false});
        } else {
            if(people >= 6) {
                let err = new Error('room is full');
                err.status = 403;
                next(err);
            } else {
                //await changePeople('people', roomCode, 1);
                res.status(200).json({
                    success: true,
                    roomCode: roomCode,
                    people: people[1][1],
                    port: port,
                });
            }
        }
    }
});

router.put('/people/:code', async (req, res, next) => {
   let roomList = await getAllGame('people');
   let roomCode = req.params.code;
    if((roomList.indexOf(roomCode)) === -1) {
        let err = new Error('cannot found room with roomCode');
        err.status = 406;
        next(err);
    }
    // let people = await getPeople('people', roomCode);
    // people = Number(people[1][1]) - 1;
    let people = req.body.people;
    if(people) {
        console.log(people);
        await redisClient.zadd("people", people, roomCode);
        //await changePeople('people', roomCode, -1);
        res.status(200).json({success: true});
    } else {
        let err = new Error('Not Found Room');
        err.status = 403;
        next(err);
    }
});

router.get('/people/:code', async (req, res, next)=>{
   let people =  await getPeople('people', roomCode);
   people = people[1][1];
   res.json({people: people});
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

router.post('/crash', async (req, res, next)=>{
    let port = req.body.port;
    let search = await searchByValue('ports', port);
    if(search) res.json(search);
});

router.delete('/key/:key', async (req, res, next)=>{
   let result = await deleteKey(req.params.key);
   res.json(result);
});

router.get('/roomAndPort/:key', async (req, res, next)=>{
   let result = await getAll(req.params.key);
   res.json(result);
});

module.exports = router;
