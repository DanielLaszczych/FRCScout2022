const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.use('/getEventsCustom/:year', (req, res) => {
    if (req.isUnauthenticated()) {
        res.send('Not signed in');
        return;
    }
    fetch(`https://www.thebluealliance.com/api/v3/events/${req.params.year}?X-TBA-Auth-Key=${process.env.BLUEALLIANCE_API_KEY}`)
        .then((response) => response.json())
        .then((data) => {
            if (!data.Error) {
                let optimizedData = data.map((event) => ({
                    name: event.name,
                    key: event.key,
                    week: event.week,
                    event_type_string: event.event_type_string,
                    start_date: event.start_date,
                    end_date: event.end_date,
                    year: event.year,
                }));
                res.send(optimizedData);
            } else {
                res.send(data);
            }
        })
        .catch((err) => {
            res.send(err);
        });
});

router.use('/:apiCall(*)', (req, res) => {
    if (req.isUnauthenticated()) {
        res.send('Not signed in');
        return;
    }
    fetch(`https://www.thebluealliance.com/api/v3/${req.params.apiCall}?X-TBA-Auth-Key=${process.env.BLUEALLIANCE_API_KEY}`)
        .then((response) => response.json())
        .then((data) => {
            if (!data.Error) {
                res.send(data);
            } else {
                res.send(data);
            }
        })
        .catch((err) => {
            res.send(err);
        });
});

module.exports = router;
