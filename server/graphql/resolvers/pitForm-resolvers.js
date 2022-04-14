const PitForm = require('../../models/PitForm');
const cloudinary = require('cloudinary').v2;

module.exports = {
    Query: {
        async getPitForm(_, { eventKey, teamNumber }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const pitForm = await PitForm.findOne({ eventKey: eventKey, teamNumber: teamNumber }).exec();
                if (!pitForm) {
                    throw new Error('Pit form does not exist');
                }
                return pitForm;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getEventsPitForms(_, { eventKey }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const pitForms = await PitForm.find({ eventKey: eventKey }).exec();
                return pitForms;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getTeamsPitForms(_, { teamNumber }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                const pitForms = await PitForm.find({ teamNumber: teamNumber, followUp: false }).exec();
                return pitForms;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
    Mutation: {
        async updatePitForm(_, { pitFormInput }, context) {
            if (!context.req.user) {
                throw new Error('You must be logged in');
            }
            try {
                let imageUrl;
                if (context.req.headers.imagetype === 'Same Image') {
                    imageUrl = pitFormInput.image;
                } else {
                    await cloudinary.uploader.upload(pitFormInput.image, (error, result) => {
                        if (error) {
                            throw new Error('Could not upload image');
                        }
                        imageUrl = result.secure_url;
                    });
                }
                pitFormInput.image = imageUrl;
                pitFormInput.scouter = context.req.user.displayName;
                pitFormInput.driveStats = [];

                if (!pitFormInput.followUp && pitFormInput.motors.length > 0 && pitFormInput.wheels.length > 0) {
                    let motorStats = null;
                    let numOfMotors = 0;
                    for (const motors of pitFormInput.motors) {
                        if (motorStats === null || motors.value > motorStats.value) {
                            motorStats = motors;
                        }
                        numOfMotors += motors.value;
                    }
                    console.log(motorStats);
                    motorStats = motorMap.get(motorStats.label);
                    let wheelStats = null;
                    for (const wheels of pitFormInput.wheels) {
                        if (wheelStats === null || wheels.value > wheelStats.value) {
                            wheelStats = wheels;
                        }
                    }
                    for (const gearRatio of pitFormInput.gearRatios) {
                        let freeSpeed = ((motorStats.freeSpeed * (((wheelStats.size * 0.0254) / 2) * 2 * Math.PI)) / (0.3048 * 60)) * (gearRatio.drivingGear / gearRatio.drivenGear);
                        let pushingPower =
                            ((motorStats.stallCurrent - motorStats.freeCurrent) / motorStats.stallTorque) *
                                (((((pitFormInput.weight * 1.1) / 1) * 4.44822161526 * wheelStats.size * 0.0254) / 2 / 0.9 / numOfMotors) * (gearRatio.drivingGear / gearRatio.drivenGear)) +
                            motorStats.freeCurrent;
                        let stat = {
                            drivingGear: gearRatio.drivingGear,
                            drivenGear: gearRatio.drivenGear,
                            freeSpeed: freeSpeed,
                            pushingPower: 100 - pushingPower,
                        };
                        pitFormInput.driveStats.push(stat);
                    }
                    console.log(pitFormInput.driveStats);
                }

                const pitForm = await PitForm.findOneAndUpdate({ eventKey: pitFormInput.eventKey, teamNumber: pitFormInput.teamNumber }, pitFormInput, { new: true, upsert: true }).exec();
                return pitForm;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};

class MotorStats {
    constructor(freeSpeed, stallTorque, stallCurrent, freeCurrent) {
        this.freeSpeed = freeSpeed;
        this.stallTorque = stallTorque;
        this.stallCurrent = stallCurrent;
        this.freeCurrent = freeCurrent;
    }
}

const motorMap = new Map();
motorMap.set('Falcon 500', new MotorStats(6380, 4.69, 257, 1.5));
motorMap.set('NEO', new MotorStats(5676, 2.6, 105, 1.8));
motorMap.set('CIM', new MotorStats(5330, 2.41, 131, 2.7));
motorMap.set('Mini-CIM', new MotorStats(5840, 1.41, 89, 3));
motorMap.set('NEO 550', new MotorStats(11000, 0.97, 100, 1.4));
motorMap.set('775 Pro', new MotorStats(18730, 0.71, 134, 0.7));
