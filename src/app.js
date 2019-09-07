const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./models').sequelize;
sequelize.sync();
const authRouter = require('./routes/auth');

const app = express();
app.set('port', process.env.PORT || 5000);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/auth', authRouter);

// don't match any router
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        success: false,
        message: err.message,
    });
});

// server listening
app.listen(app.get('port'), () => {
    console.log(`server listening on ${app.get('port')} port.`);
});
