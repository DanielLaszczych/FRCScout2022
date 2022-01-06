const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

const serverOptions = (app) => {
    app.use(express.json({ limit: '5mb' }));
    app.use(express.urlencoded({ extended: false }));
};

serverOptions(app);

startServer();

async function startServer() {
    // since the express server has cors configured, cors on the apollo server
    // can be false; passing the same options as defined on the express instance
    // works as well

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

    app.listen({ port: PORT });
    console.log(`Server running at http://localhost:${PORT}`);
}
