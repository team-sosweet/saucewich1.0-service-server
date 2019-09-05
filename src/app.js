const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./models').sequelize;
sequelize.sync();

const app = express();
app.set('port', process.env.PORT || 5000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// don't match any router
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
});

// server listening
app.listen(app.get('port'), () => {
    console.log(`server listening on ${app.get('port')} port.`);
});
