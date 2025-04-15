const express = require('express');
require('dotenv').config()
const connection = require('./server/database/db');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');

// routers
const apiRouter = require('./server/routers/api');
const digiRouter = require('./server/routers/digi');

const app = express()
const PORT = process.env.PORT

connection();


app.use(express.urlencoded({ extended: true })); // add this line
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout')

app.use(express.static(path.join(__dirname, 'public')));


app.use('/api' , apiRouter);
app.use('/' , digiRouter);



app.listen(PORT, () => console.log('app is listening to ' + PORT))