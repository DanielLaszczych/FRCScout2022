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
                let matchForms = await MatchForm.find({ eventKey: req.params.eventKey, followUp: false, noShow: false }).lean().exec();

                let matchFormMap = new Map();
                for (let matchForm of matchForms) {
                    if (!matchFormMap.has(matchForm.teamNumber)) {
                        matchFormMap.set(matchForm.teamNumber, 1);
                        matchForm.matchIndex = 1;
                    } else {
                        let matchIndex = matchFormMap.get(matchForm.teamNumber);
                        matchForm.matchIndex = matchIndex + 1;
                        matchFormMap.set(matchForm.teamNumber, matchIndex + 1);
                    }
                }

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
                        let matchForms = await MatchForm.find({ eventKey: req.params.eventKey, followUp: false, noShow: false }).lean().exec();

                        let matchFormMap = new Map();
                        for (let matchForm of matchForms) {
                            if (!matchFormMap.has(matchForm.teamNumber)) {
                                matchFormMap.set(matchForm.teamNumber, 1);
                                matchForm.matchIndex = 1;
                            } else {
                                let matchIndex = matchFormMap.get(matchForm.teamNumber);
                                matchForm.matchIndex = matchIndex + 1;
                                matchFormMap.set(matchForm.teamNumber, matchIndex + 1);
                            }
                        }

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
