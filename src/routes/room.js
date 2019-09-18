const express = require('express');
const redisClient = require('../models/redisClient');
const { getAllKeys, getAllData, getValue, deleteKey, newRoomCode } = require('./util');

let router = express.Router();

router.post('/', async (req, res, next) => {
    let roomList = await getAllKeys();
    let allow = false;
    let roomCode = '';
    while(allow === false) {
        roomCode = newRoomCode(3);
        console.log('roomCode : '+roomCode);
        console.log(roomList);
        if((roomList.indexOf(roomCode)) === -1) {
            allow = true;
        }
    }
    let people = await redisClient.hmset(roomCode, {people:0});
    let result = await getAllData(roomCode);
    if(result) res.json({roomCode:roomCode, info:result});
});

router.get('/join/:code', async (req, res, next) => {
    let roomList = await getAllKeys();
    let roomCode = req.params.code;
    if((roomList.indexOf(roomCode)) === -1) {
        //error 처리
        res.json();
    }
    let people = await getValue(roomCode, 'people');
    console.log(Number(people));
    if(people >= 6) {
        //error 처리
        res.json();
    }
    let result = await redisClient.hmset(roomCode, {people:Number(people)+1});
    res.status(200).json({
        success: true,
        roomCode: roomCode,
        people: Number(people)+1,
    });
});

router.patch('/exit/:code', async (req, res, next) => {
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
