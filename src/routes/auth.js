const express = require('express');
const crypto = require('crypto');
const User = require('../models').User;

const router = express.Router();

router.post('/sign_up', (req, res, next) => {
    let body = req.body;

    crypto.randomBytes(64, (err, salt)=>{
        crypto.pbkdf2(body.password, salt.toString('base64'), 10000, 64, 'sha512', async function (err, key) {
            let user = await User.create({
                id: body.id,
                password: key.toString('base64'),
                salt: salt.toString('base64'),
            });

            res.json(user);
        })
    });
});

router.post('/sign_in', async (req, res, next) => {
    let body = req.body;
    const { salt, password } = await User.findOne({
        where: {id: body.id}
    });
    crypto.pbkdf2(body.password, salt, 10000, 64, 'sha512', (err, key) => {
        if(password === key.toString('base64'))
            res.json({success: true});
    })
});

module.exports = router;
