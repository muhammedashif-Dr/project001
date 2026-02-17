const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware'); // Will create this implicitly or inline it if simpler, but user asked for proper error handling
const connectDB = require('./config/db');
const port = process.env.PORT || 5000;
const cors = require('cors');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/users', require('./routes/auth'));

app.use(errorHandler);
app.get('/', (req, res) => {
    res.send('server is running')
});
app.listen(port, () => console.log(`Server started on port ${port}`));
