require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const notesRouter = require('./routes/notes');
const authRouter = require('./routes/auth');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/api/notes', notesRouter);
app.use('/api/auth', authRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notes-app';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});
