// node modules
const fs = require('fs');
const cp = require('child_process');
const readline = require('readline');

// external modules
const ytdl = require('ytdl-core');
var ffmpeg = require('ffmpeg-static');

const { getFullDownloadPath, TYPES } = require('./downloadPath');

const VIDEO_QUALITIES = {
    hd1080: 'hd1080',
    hd720: 'hd720',
    l480: 'large',
    m360: 'medium',
    s240: 'small',
    t144: 'tiny'
}

const downloadVideo = async (link, animation, quality) => {
    const stopTheSpinner = await animation();
    const videoInfo = await ytdl.getInfo(link);
    const videoPath = getFullDownloadPath(videoInfo.videoDetails.title, TYPES.VIDEO);
    try {
        const video = ytdl(link, {
            filter: format => {
                return format.mimeType.includes('video/mp4') && format.quality === quality
            }
        });
        const audio = ytdl(link, {
            filter: format => {
                return format.mimeType.includes('audio/webm')
            }
        });
        margeAudioAndVedio(video, audio, videoPath, stopTheSpinner);
    } catch (error) {
        console.log(error);
    }
}

const margeAudioAndVedio = (video, audio, path, stopTheSpinner) => {
    const ffmpegProcess = cp.spawn(ffmpeg, [
        // Remove ffmpeg's console spamming
        '-loglevel', '8', '-hide_banner',
        // Set inputs
        '-i', 'pipe:3',
        '-i', 'pipe:4',
        // Map audio & video from streams
        '-map', '0:a',
        '-map', '1:v',
        // Keep encoding
        '-c:v', 'copy',
        // Define output file
        path,
    ], {
        windowsHide: true,
        stdio: [
            /* Standard: stdin, stdout, stderr */
            'inherit', 'inherit', 'inherit',
            /* Custom: pipe:3, pipe:4, */
            , 'pipe', 'pipe',
        ],
    });

    ffmpegProcess.on('close', () => {
        stopTheSpinner();
    });

    audio.pipe(ffmpegProcess.stdio[3]);
    video.pipe(ffmpegProcess.stdio[4]);
}
const downloadAudio = async (link, animation) => {
    const stopTheSpinner = await animation();
    const videoInfo = await ytdl.getInfo(link);
    const videoPath = getFullDownloadPath(videoInfo.videoDetails.title, TYPES.AUDIO);
    try {
        const outputStream = fs.createWriteStream(videoPath);
        ytdl(link, {
            filter: format => {
                return format.mimeType.includes('audio/mp4')
            }
        }).pipe(outputStream);
        outputStream.on('close', () => {
            stopTheSpinner();
        })
    } catch (error) {
        console.log(error);
    }
}


const download = (link, argv, animation) => {
    if (argv['--audio']) {
        downloadAudio(link, animation)
    } else if (argv['--help'] || link === '--help') {
        console.log('to download audio only add flag --audio');
        console.log('to customize the video quality add one of the following flags:')
        for (const key in VIDEO_QUALITIES) {
            console.log(`--${key} -> ${parseInt(key.match(/\d+/)[0])}p `);
        }
    } else {
        // vedio
        let noQualityFlag = true;
        for (const key in VIDEO_QUALITIES) {
            if (argv[`--${key} `]) {
                noQualityFlag = false;
                downloadVideo(link, animation, VIDEO_QUALITIES[key])
            }
        }

        if (noQualityFlag) {
            downloadVideo(link, animation, VIDEO_QUALITIES.hd1080)
        }
    }
}


module.exports = { download }