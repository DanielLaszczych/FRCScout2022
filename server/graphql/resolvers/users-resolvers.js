const User = require('../../models/User');

module.exports = {
    Query: {
        async getUsers() {
            try {
                const users = await User.find().exec();
                return users;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getUser(_, { _id }) {
            try {
                const user = await User.findById(_id).exec();
                return user;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
