const express = require('express');
const router = express.Router();
const MatchForm = require('../models/MatchForm');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    const domain = payload['hd'];
    if (!(domain && domain === 'robotigers1796.com')) {
        throw new Error('Not a robotigers account');
    }
}

router.use('/getEventData/:eventKey/:token?', async (req, res) => {
    if (req.params.token === undefined) {
        if (req.isUnauthenticated()) {
            res.send('Not signed in');
            return;
        } else {
            try {
                const matchForms = await MatchForm.find({ eventKey: req.params.eventKey }).exec();
                res.send(matchForms);
            } catch (err) {
                res.send(err);
            }
        }
    } else {
        await verify(req.params.token)
            .then(async () => {
                try {
                    const matchForms = await MatchForm.find({ eventKey: req.params.eventKey }).exec();
                    res.send(matchForms);
                } catch (err) {
                    res.send(err);
                }
            })
            .catch((err) => {
                res.send('Not signed in');
                return;
            });
    }
});

module.exports = router;
