const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');


const authRoutes = require("./routes/auth.routes")


const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(morgan('dev'));

// Routes
app.use('/api/auth',authRoutes);

module.exports = app;