const express = require('express');
require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { connectDB } = require('./database/database');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

(async() => {
  await connectDB(process.env.DATABASE_URL,process.env.DATABASE_NAME)
})();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
