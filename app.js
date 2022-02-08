const express = require('express');
const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser')
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const bookRouter = require('./routes/bookRoutes');
const commentRouter = require('./routes/commentRoutes');
const contactRouter = require('./routes/contactRoutes');
const imageRouter = require('./routes/imageRoutes');
const clubRouter = require('./routes/clubRoutes');
const postRouter = require('./routes/postRoutes');
const notificationRouter = require('./routes/notificationRoutes');


const app = express();

//1) Global middleware

app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views' ))

// const allowCrossDomain = function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', 'https://www.app.reaflect.com');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Origin, X-Requested, Content-Type, Accept Authorization');

//     // intercept OPTIONS method
//     if (req.method === 'OPTIONS') {
//         res.sendStatus(200);
//     }
//     else {
//       next();
//     }
// };
const origins = process.env.URL.split(' ')
app.use(cors({ origin: origins, credentials: true }));
app.options('*', cors());

// app.use(allowCrossDomain);

//Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Set security HTTP headers
app.use(helmet())

//Development Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//Limit requests from same API
// const limiter = rateLimit({
//     max: 100,
//     windowMs: 60 * 60 * 1000,
//     message: 'Too many requests from this IP, please try again in one hour'
// });
// app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({
    limit: '10kb'
}));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
}))

//Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});


//Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/notification', notificationRouter);
app.use('/api/v1/images', imageRouter);
app.use('/api/v1/clubs', clubRouter);
app.use('/api/v1/posts', postRouter);

app.all('*', (req, res, next) => {

    next(new AppError(`Can't find ${req.originalUrl}`, 404))
});

app.use(globalErrorHandler);

module.exports = app;