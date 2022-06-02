const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.use('/sendMessage', async (req, res) => {
    const body = {
        bot_id: process.env.GROUPME_BOT_ID,
        text: req.body.text,
    };
    const response = await fetch('https://api.groupme.com/v3/bots/post', {
        method: 'POST',
        body: JSON.stringify(body),
    });
    res.sendStatus(response.status);
});

router.use('/receivedMessage', async (req, res) => {
    console.log(req.body);
    res.sendStatus(202);
});
module.exports = router;
