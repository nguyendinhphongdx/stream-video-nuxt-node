const express = require('express')
const router = express.Router()
const videos = require('../mockData')
const fs = require('fs')

// get list of video
router.get('/', (req, res) => {
    res.json(videos)
})

// make request for a particular video
router.get('/:id/data', (req, res) => {
    const id = parseInt(req.params.id, 10)
    res.json(videos[id])
})

//streaming route
router.get('/video/:id', (req, res) => {
    const videoPath = `assets/${req.params.id}.mp4`;
    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const range = req.headers.range;
    if (range) {
        const chunkSize = 1 * 1e6;
        const start = Number(range.replace(/\D/g, ""))
        const end = Math.min(start + chunkSize, fileSize - 1)
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4"
        }
        res.writeHead(206, headers)
        const stream = fs.createReadStream(videoPath, {
            start,
            end
        })
        stream.pipe(res)
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});
// captions route
router.get('/video/:id/caption', (req, res) => res.sendFile(`assets/captions/${req.params.id}.vtt`, { root: process.cwd() }));
module.exports = router;