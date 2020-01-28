const router = require('express').Router(),
      {post, get} = require('superagent'),
      error = (res, msg) => res.json({status: false, message: msg}),
      config = require("../util/config"),
      database = require("../util/Schemas"),
      encrypt = require('../util/encryption'),
      en = new encrypt(config.encryption)
router.get("/", (req, res) => res.render('index'));

router.post('/add', async (req, res) => {
    try{
        let {userID, webhook, passcode} = req.body;
        if(!userID) return error(res, `You didn't provide "userID" in the body request!`);
        if(!webhook) return error(res, `You didn't provide "webhook" in the body request!`);
        if(!passcode) return error(res, `You didn't provide "passcode" in the body request!`);
        let db = await database.voting.findOne({clientID: userID});
        if(!db){
            new database.voting({
                clientID: userID,
                webhook: en.encrypt(webhook),
                passcode: en.encrypt(passcode)
            }).save().catch(() => {});
            console.log(`[ADDED] | Client ID: ${userID}`);
            return res.json({status: true, message: `Endpoint created for ${userID}\nPoint the DBL(top.gg) website to: ${config.baseURL}/dbl/${userID} and your passcode to the one you just set!`});
        };
        return error(res, `You already have a voting database!`);
    }catch(err){
        return error(res, err.message);
    }
});
router.get("/:id", async (req, res) => {
    try{
        let {id} = req.params, key = req.get("authorization") || req.query.authorization;
        if(!key) return error(res, "You didn't provide the 'authorization' header!");
        let db = await database.voting.findOne({clientID: id});
        if(!db) return error(res, `I could not find ${id} in the database!`);
        if(en.decrypt(db.passcode) !== key) return error(res, `That isn't a valid passcode!`);
        let hook = en.decrypt(db.webhook);
        let user = await get(`https://elara-getuser.glitch.me/users/${req.body.user}`).catch(() => {});
        if(!user) return error(res, `I was unable to fetch the user information for ${req.body.user}`);
        if(user.status !== 200) return error(res, `I was unable to fetch the user information for ${req.body.user}`);
        let re = await post(hook).send({
            "embeds": [
                {
                    title: "Vote Here",
                    url: `https://top.gg/bot/${req.body.bot}/vote`,
                    color: 0xbc00ff,
                    timestamp: new Date(),
                    author: {
                        name: `New${req.body.type !== "upvote" ? " Test" : ""} Vote By: @${user.body.user.tag}`,
                        icon_url: user.body.user.avatarURL
                    },  
                    footer: {
                        text: `Discord Bot List`,
                        icon_url: `https://superchiefyt.tk/d/m/DBL.gif`
                    }
                }
            ]
        }).catch(() => {});
        if(!re) return error(res, `The webhook listed with the account is no longer valid or Discord is having issues!`);
        console.log(`[POST, WEBHOOK] | Client ID: ${id}`)
        res.json({status: true, message: `Sent to webhook`});
        return console.log(db, req.body);
    }catch(err){
        console.log(err.stack)
        return error(res, err.message);
    }
});
router.get("/delete/:id", async (req, res) => {
    try{
        let {id} = req.params, {passcode} = req.body;
        if(!passcode) return error(res, `You didn't provide the 'passcode' in the body request!`);
        let db = await database.voting.findOne({clientID: id});
        if(!db) return error(res, `I was unable to find ${id} in the system!`);
        if(en.decrypt(db.passcode) !== passcode) return error(res, `The 'passcode' you provided isn't valid!`);
        console.log(`[DELETED] | Client ID: ${id}`)
        db.remove().catch(() => {});
        return res.json({status: true, message: `Client: ${id} has been removed from our system!`});
    }catch(err){
        return error(res, err.message);
    }
});

module.exports = router;