/* eslint-disable import/order */
/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {createServer} = require('http');
const {Server} = require('socket.io');


process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION 💥 Shutting down...');
    console.log(err.name, err.message);
    console.log(err);
    process.exit(1)
});

dotenv.config({
    path: './config.env'
});
const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log('DB connection successful');
    });


const port = process.env.PORT || 3000;
// const server = app.listen(port, () => {
//     console.log(`running on port ${port}`);
// });

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: {
    origin: "*"
  } });

io.on("connection", () => {
  console.log('connected');
});

app.io = io;

httpServer.listen(port);

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION 💥 Shutting down...');
    console.log(err.name, err.message);
    httpServer.close(() => {
        process.exit(1)
    });
});