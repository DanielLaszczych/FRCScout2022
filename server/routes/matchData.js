const express = require('express');
const router = express.Router();
const MatchForm = require('../models/MatchForm');
const bcrypt = require('bcrypt');

router.use('/getEventData/:eventKey/:password?', async (req, res) => {
    if (req.params.password === undefined) {
        if (req.isUnauthenticated()) {
            res.send('Not signed in');
            return;
        } else {
            try {
                const matchForms = await MatchForm.find({ eventKey: req.params.eventKey, followUp: false }).exec();
                res.send(matchForms);
            } catch (err) {
                res.send(err);
            }
        }
    } else {
        await bcrypt
            .compare(req.params.password, process.env.TABLEAU_HASH)
            .then(async (result) => {
                if (result) {
                    try {
                        const matchForms = await MatchForm.find({ eventKey: req.params.eventKey, followUp: false }).exec();
                        res.send(matchForms);
                    } catch (err) {
                        res.send(err);
                    }
                } else {
                    res.send('Wrong password');
                }
            })
            .catch((err) => {
                res.send('Wrong password');
                return;
            });
    }
});

module.exports = router;
