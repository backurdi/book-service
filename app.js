const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser')
var cors = require('cors')

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const bookRouter = require('./routes/bookRoutes');
const commentRouter = require('./routes/commentRoutes');
const contactRouter = require('./routes/contactRoutes');


const app = express();

//1) Global middleware

app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'))

// Cors rules
const corsOptions = {
    origin: "https://www.app.readee.org/",
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    allowedHeaders: [
        'Content-Type',
      ],
}

app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

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

app.all('*', (req, res, next) => {

    next(new AppError(`Can't find ${req.originalUrl}`, 404))
});

app.use(globalErrorHandler);

module.exports = app;