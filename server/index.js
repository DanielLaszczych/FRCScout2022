const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();
require('./auth/passport');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const app = express();

app.enable('trust proxy');
const PORT = process.env.PORT || 5000;

const corsPolicy = async (req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
};

app.options('*', cors());
app.use(corsPolicy);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        store: MongoStore.create({
            mongoUrl: process.env.DATABASE_URL,
        }),
        cookie: {
            sameSite: `${process.env.NODE_ENV === 'production' ? 'none' : 'lax'}`, // cross site // set lax while working with http:localhost, but none when in prod
            secure: `${process.env.NODE_ENV === 'production' ? 'true' : 'auto'}`, // only https // auto when in development, true when in prod
            maxAge: 1000 * 60 * 60 * 24 * 14, // expiration time
        },
    })
);

const serverOptions = (app) => {
    app.use(express.json({ limit: '5mb' }));
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(passport.initialize());
    app.use(passport.session());
};

serverOptions(app);

//routes
app.use('/auth', require('./routes/auth'));
app.use('/getuser', (req, res) => {
    res.send(req.user);
});

const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers,
    context: ({ req, res }) => ({ req, res }),
});

startServer();

async function startServer() {
    // since the express server has cors configured, cors on the apollo server
    // can be false; passing the same options as defined on the express instance
    // works as well
    await server.start();
    server.applyMiddleware({ app, path: '/graphql', cors: true });

    if (process.env.NODE_ENV === 'production') {
        app.use(express.static('../client/build'));
        app.get('*', (request, response) => {
            response.sendFile(path.join(__dirname, '../client/build', 'index.html'));
        });
    } else {
        app.get('/', (req, res) => {
            res.send('Hello World!');
        });
    }

    mongoose
        .connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
        })
        .then((m) => {
            console.log('MongoDB Connected');
            return app.listen({ port: PORT });
        })
        .then((res) => {
            console.log(`Server running at http://localhost:${PORT}`);
        })
        .catch((err) => {
            console.error(err);
        });
}
