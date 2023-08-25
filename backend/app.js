const express = require('express');
const fs = require('fs');
const cors = require('cors');
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

app.listen(process.env.PORT || 5000, () => {
    console.log('Listening on port 5000!')
});

