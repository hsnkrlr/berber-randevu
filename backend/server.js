const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Burası ÖNEMLİ: uploads klasörünü statik olarak sun
app.use('/uploads', express.static('uploads'));

const appointmentsRouter = require('./appointments');
app.use('/appointments', appointmentsRouter);

const settingsRouter = require('./settings');
app.use('/settings', settingsRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
