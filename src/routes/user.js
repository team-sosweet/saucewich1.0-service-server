const experss = require('express');
const User = require('../models').User;
const {maxExp, checkJWT, addPlaytime} = require('./util');

const router = experss.Router();

router.put('/info', checkJWT, async (req, res, next) => {
    if(!req.body.exp || !req.body.kill || !req.body.death || !req.body.win || !req.body.playtime ||!req.body.id) {
        let err = new Error('Need user info');
        err.status = 403;
        next(err);
    } else {
        let user = await User.findOne({
            where: {
                id: req.body.id,
            }
        });
        let level = user.level;
        let earnExp = Number(req.body.exp);
        let fullExp = await maxExp(level);
        let remainExp = user.exp;
        if(remainExp + earnExp >= fullExp) {
            remainExp = remainExp + earnExp;
            while(remainExp >= fullExp) {
                level++;
                remainExp = remainExp - fullExp;
                fullExp = maxExp(level);
            }
        } else{
            remainExp = remainExp + earnExp;
        }
        let kill = Number(user.kill) + Number(req.body.kill);
        let death = Number(user.death) + Number(req.body.death);
        let playtime = addPlaytime(user.playtime, req.body.playtime);
        let win = 0, lose = 0;
        if(Number(req.body.win) === 1) {
            win = Number(user.win) + 1;
            lose = user.lose;
        } else {
            lose = Number(user.lose) + 1;
            win = user.win;
        }
        await User.update({
            level: level,
            exp: remainExp,
            kill: kill,
            death: death,
            win: win,
            lose: lose,
            playtime: playtime,
        }, {
            where: {id: req.body.id}
        });
        res.json({
            id: user.id,
            level: level,
            exp: remainExp,
            kill: kill,
            death: death,
            win: win,
            lose: lose,
            playtime: playtime,
        })
    }
});

module.exports = router;
