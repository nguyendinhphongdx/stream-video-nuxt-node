const express = require('express');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config()
const path = require('path');
const app = express();
app.use(cors())

app.get('/', (req, res) => {
    res.sendFile('hls-videos.html', { root: __dirname });
});

app.get('/blob', (req, res) => {
    res.sendFile('blob.html', { root: __dirname });
});

//videos route
const Videos = require('./routes/Videos')
app.use('/videos', Videos)

app.listen(process.env.PORT || 80, () => {
    console.log('Listening on port 5000!')
});

