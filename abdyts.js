#! /usr/bin/env node
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers')
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const term = require('terminal-kit').terminal;
const { argv } = yargs(hideBin(process.argv));
const DOWNLOAD_FOLDER = "Cli Downloader"
const DOWNLOAD_FOLDER_PATH = path.join(process.env.USERPROFILE, 'downloads', DOWNLOAD_FOLDER);
const notAllowedCharacters = [
    "#", "<", "$", "+", "%", ">", "!", "`", "&", "*", "'", "|", "{", "?", "\"", "=", "}", "/", ":", "\\", "@"
]

const createFileName = (name) => {
    notAllowedCharacters.forEach(charcter => {
        name = name.replaceAll(charcter, " ");
    });
    return name;
}

const getFullDownloadPath = (fileName) => {
    try {
        if (!fs.existsSync(DOWNLOAD_FOLDER_PATH)) {
            fs.mkdirSync(DOWNLOAD_FOLDER_PATH);
        }
        return path.join(DOWNLOAD_FOLDER_PATH, fileName);
    } catch (err) {
        console.error(err);
    }
}

const LINK = argv._[0];
const downloadVideo = async (link) => {
    const stopTheSpinner = await animation();
    const videoInfo = await ytdl.getInfo(link);
    const videoName = `${createFileName(videoInfo.videoDetails.title)}.mp4`;
    const videoPath = getFullDownloadPath(videoName);
    try {
        const outputStream = fs.createWriteStream(videoPath);
        ytdl(link, { format: 'mp4' }).pipe(outputStream)
        outputStream.on('close', () => {
            stopTheSpinner();
        })
    } catch (error) {
        console.log(error);
    }
}

const animation = async () => {
    term.colorRgb(255, 0, 0)
    term("downloading ");
    const spinner = await term.spinner('dotSpinner');
    const stopTheSpinner = async () => {
        await spinner.destroy();
        term.nextLine();
        term.colorRgb(0, 255, 0)
        term.bold("your download done successfully, check the downloads folder")
        process.exit(0);
    }
    return stopTheSpinner;
}

downloadVideo(LINK);

