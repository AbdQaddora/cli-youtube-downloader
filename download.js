// node modules
const fs = require('fs');
const path = require('path');

// external modules
const youtubedl = require('youtube-dl-exec');

const { getFullDownloadPath, TYPES } = require('./downloadPath');

const VIDEO_QUALITIES = {
    hd1080: 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[ext=mp4]/best',
    hd720: 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[ext=mp4]/best',
    l480: 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[ext=mp4]/best',
    m360: 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[ext=mp4]/best',
    s240: 'bestvideo[height<=240][ext=mp4]+bestaudio[ext=m4a]/best[height<=240][ext=mp4]/best[ext=mp4]/best',
    t144: 'bestvideo[height<=144][ext=mp4]+bestaudio[ext=m4a]/best[height<=144][ext=mp4]/best[ext=mp4]/best'
}

const downloadVideo = async (link, animation, quality) => {
    const stopTheSpinner = await animation();
    try {
        // Get video info first
        const videoInfo = await youtubedl(link, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true
        });
        
        const videoPath = getFullDownloadPath(videoInfo.title, TYPES.VIDEO);
        
        // Download with specified quality
        const downloadProcess = youtubedl.exec(link, {
            output: videoPath,
            format: quality,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            mergeOutputFormat: 'mp4'
        });
        
        downloadProcess.on('close', (code) => {
            if (code === 0) {
                stopTheSpinner();
            } else {
                console.error('Download failed with code:', code);
                stopTheSpinner();
                process.exit(1);
            }
        });
        
        downloadProcess.on('error', (error) => {
            console.error('Download process error:', error.message);
            stopTheSpinner();
            process.exit(1);
        });
        
    } catch (error) {
        console.error('Error downloading video:', error.message);
        stopTheSpinner();
        process.exit(1);
    }
}


const downloadAudio = async (link, animation) => {
    const stopTheSpinner = await animation();
    try {
        // Get video info first
        const videoInfo = await youtubedl(link, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true
        });
        
        const audioPath = getFullDownloadPath(videoInfo.title, TYPES.AUDIO);
        
        // Download audio only
        const downloadProcess = youtubedl.exec(link, {
            output: audioPath,
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: '0',
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true
        });
        
        downloadProcess.on('close', (code) => {
            if (code === 0) {
                stopTheSpinner();
            } else {
                console.error('Audio download failed with code:', code);
                stopTheSpinner();
                process.exit(1);
            }
        });
        
        downloadProcess.on('error', (error) => {
            console.error('Audio download process error:', error.message);
            stopTheSpinner();
            process.exit(1);
        });
        
    } catch (error) {
        console.error('Error downloading audio:', error.message);
        stopTheSpinner();
        process.exit(1);
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
        // video
        let noQualityFlag = true;
        let qualityToUse = VIDEO_QUALITIES.hd1080;
        
        for (const key in VIDEO_QUALITIES) {
            if (argv[`--${key}`]) {
                noQualityFlag = false;
                qualityToUse = VIDEO_QUALITIES[key];
                break;
            }
        }

        // Download video with fallback
        downloadVideoWithFallback(link, animation, qualityToUse);
    }
}

const downloadVideoWithFallback = async (link, animation, quality) => {
    try {
        await downloadVideo(link, animation, quality);
    } catch (error) {
        console.log('Primary download method failed, trying fallback...');
        
        // Fallback: try to download with best available format
        try {
            const stopTheSpinner = await animation();
            
            // Get video info first
            const videoInfo = await youtubedl(link, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true
            });
            
            const videoPath = getFullDownloadPath(videoInfo.title, TYPES.VIDEO);
            
            // Download with best available format
            const downloadProcess = youtubedl.exec(link, {
                output: videoPath,
                format: 'best[ext=mp4]/best',
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                mergeOutputFormat: 'mp4'
            });
            
            downloadProcess.on('close', (code) => {
                if (code === 0) {
                    stopTheSpinner();
                } else {
                    console.error('Fallback download failed with code:', code);
                    stopTheSpinner();
                    process.exit(1);
                }
            });
            
            downloadProcess.on('error', (error) => {
                console.error('Fallback download process error:', error.message);
                stopTheSpinner();
                process.exit(1);
            });
            
        } catch (fallbackError) {
            console.error('Both primary and fallback methods failed:', fallbackError.message);
            console.log('This might be due to YouTube restrictions or the video being unavailable.');
            process.exit(1);
        }
    }
}

module.exports = { download }