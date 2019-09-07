const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models').User;

const router = express.Router();

router.post('/sign_up', (req, res, next) => {
    let body = req.body;
    crypto.randomBytes(64, (err, salt) => {
        crypto.pbkdf2(body.password, salt.toString('base64'), 10000, 64, 'sha512', async function (err, key) {
            try {
                let user = await User.create({
                    id: body.id,
                    password: key.toString('base64'),
                    salt: salt.toString('base64'),
                });

                if (user) res.json({success: true, message: "sign up success."});
            } catch (error) {
                let err = new Error('Conflict : User already exist.');
                err.status = 409;
                next(err);
            }
        })
    });
});

router.post('/sign_in', async (req, res, next) => {
    let body = req.body;
    try {
        const user = await User.findOne({
            where: {id: body.id}
        });
        crypto.pbkdf2(body.password, user.salt, 10000, 64, 'sha512', async (err, key) => {
            if (user.password === key.toString('base64')) {
                const AccessToken = jwt.sign({id: user.id, type: 'access'}, process.env.JWT_SECRET, {expiresIn: '12h'});
                const RefreshToken = jwt.sign({id: user.id, type: 'refresh'}, process.env.JWT_SECRET, {expiresIn: '14 days'});

                await User.update({refreshToken: RefreshToken}, {where: {id: user.id}});

                let KD = (Number(user.kill) / Number(user.death));
                let WL = (Number(user.win) / Number(user.lose));

                if (isNaN(KD))
                    KD = 0;
                if (isNaN(WL))
                    WL = 0;

                res.status(201).json({
                    success: true,
                    user: {
                        id: user.id,
                        level: user.level,
                        exp: user.exp,
                        playTime: user.playTime,
                        KD: KD.toFixed(2),
                        WL: WL.toFixed(2),
                    },
                    AccessToken: AccessToken,
                    RefreshToken: RefreshToken,
                });
            } else {
                let err = new Error('Invalid id or password');
                err.status = 401;
                next(err);
            }
        });
    } catch (error) {
        let err = new Error('Invalid id or password');
        err.status = 401;
        next(err);
    }
});

router.get('/refresh', async (req, res, next)=> {
   const token = req.get(`X-Refresh-Token`);
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   try{
       if(decoded.type === 'refresh') {
           const { refreshToken, id } = await User.findOne({
               where: {id: decoded.id}
           });
           if(refreshToken === token) {
               const AccessToken = jwt.sign({id: id, type: 'access'}, process.env.JWT_SECRET, {expiresIn: '12h'});
               const RefreshToken = jwt.sign({id: id, type: 'refresh'}, process.env.JWT_SECRET, {expiresIn: '14 days'});

               await User.update({refreshToken: RefreshToken}, {where: {id: id}});

               res.status(201).json({
                   success: true,
                   AccessToken: AccessToken,
                   RefreshToken: RefreshToken,
               });
           } else {
               let err = new Error('refresh_ttl_finished');
               err.status=401;
               next(err);
           }
       } else {
           let err = new Error('Invalid Token');
           err.status=400;
           next(err);
       }
   } catch (error) {
       next(error);
   }
});

module.exports = router;
