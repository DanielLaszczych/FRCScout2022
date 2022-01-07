const User = require('../../models/User');

module.exports = {
    Query: {
        async getUsers() {
            try {
                const users = await User.find();
                return users;
            } catch (err) {
                throw new Error(err);
            }
        },
        async getUser(_, { _id }) {
            try {
                const user = await User.findById(_id);
                return user;
            } catch (err) {
                throw new Error(err);
            }
        },
    },
};
