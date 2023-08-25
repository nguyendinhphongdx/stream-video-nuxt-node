const express = require('express')
const router = express.Router()
const videos = require('../mockData')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg');

// get list of video
router.get('/', (req, res) => {
    // const converter = videos.map(video => {
    //     const videoPath = `assets/${video.id}.mp4`;
    //     if(){}
    //     const size = fs.statSync(videoPath).size;
    //     return { ...video, size };
    // });
    res.json(videos);
})

// make request for a particular video
router.get('/:id/data', (req, res) => {
    const id = parseInt(req.params.id, 10);

    res.json(videos[id]);
})

//streaming route
router.get('/video/:id', (req, res) => {
    const videoPath = `assets/${req.params.id}.mp4`;
    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const chunkSize = 3 * 1024 * 1024; // 3MB
    const totalChunks = Math.ceil(fileSize / chunkSize);


    const range = req.headers.range;
    if (range) {
        const [start, end] = range.replace('bytes=', '').split('-');
        const startByte = parseInt(start, 10);
        const endByte = end ? Math.min(parseInt(end, 10), startByte + chunkSize - 1) : startByte + chunkSize - 1;

        const contentLength = endByte - startByte + 1;
        const headers = {
            'Content-Range': `bytes ${startByte}-${endByte}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, headers);

        const readStream = fs.createReadStream(videoPath, { start: startByte, end: endByte });

        readStream.pipe(res);
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

router.get('/convert/:id', (req, res) => {
    const videoPath = process.cwd() + `/assets/${req.params.id}.mp4`;
    const inputFilePath = videoPath; // Đường dẫn đến tệp video đầu vào
    const outputFolder = process.cwd() + '/assets/m3u8/' + req.params.id; // Thư mục đầu ra cho các phân đoạn và tệp m3u8

    if (fs.existsSync(outputFolder)) {
        return res.send('Video đã được chuyển đổi.');
    } else {
        // Nếu chưa tồn tại, tạo thư mục
        fs.mkdirSync(outputFolder);
    }
    // Thực hiện chuyển đổi video thành định dạng m3u8 và các phân đoạn
    ffmpeg(inputFilePath)
        .outputOptions(['-hls_time 10', '-hls_list_size 0', `-hls_segment_filename ${outputFolder}/segment%d.ts`])
        .output(`${outputFolder}/${req.params.id}.m3u8`) // Tệp đầu ra m3u8
        .on('end', () => {
            console.log('Chuyển đổi hoàn thành.');
            res.send('Chuyển đổi hoàn thành.');
        })
        .on('error', (err) => {
            console.error('Lỗi chuyển đổi:', err);
            res.status(500).send('Lỗi chuyển đổi.');
        })
        .run();
});

// Định nghĩa route trả về playlist M3U8
router.get('/playlist/:id/:segment', (req, res) => {
    const playlistPath = process.cwd() + `/assets/m3u8/${req.params.id}/${req.params.segment}`; // Đường dẫn tới tệp playlist thực tế
    if (fs.existsSync(playlistPath)) {
        const stream = fs.createReadStream(playlistPath);
        res.setHeader('Cache-Control', 'max-age=3600');
        stream.pipe(res);
    } else {
        res.status(404).end();
    }

});

module.exports = router;