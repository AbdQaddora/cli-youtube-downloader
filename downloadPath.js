const path = require('path');
const fs = require('fs');

const DOWNLOAD_FOLDER = "Cli Downloader";
const PATHS = {
    VIDEO: path.join(process.env.USERPROFILE, 'downloads', DOWNLOAD_FOLDER, 'videos'),
    AUDIO: path.join(process.env.USERPROFILE, 'downloads', DOWNLOAD_FOLDER, 'audio')
}

const TYPES = {
    VIDEO: { pathType: 'VIDEO', extention: 'mp4' },
    AUDIO: { pathType: 'AUDIO', extention: 'mp3' },
}

const NOT_ALLOWED_CHARACTERS = [
    "#", "<", "$", "+", "%", ">", "!", "`", "&", "*", "'", "|", "{", "?", "\"", "=", "}", "/", ":", "\\", "@"
]

const getValidFileName = (name) => {
    NOT_ALLOWED_CHARACTERS.forEach(charcter => {
        name = name.replaceAll(charcter, " ");
    });
    return name;
}

const checkFoldersAndReturnThePath = (fileName, type) => {
    try {
        if (!fs.existsSync(path.join(process.env.USERPROFILE, 'downloads', DOWNLOAD_FOLDER))) {
            fs.mkdirSync(path.join(process.env.USERPROFILE, 'downloads', DOWNLOAD_FOLDER));
        }
        if (!fs.existsSync(PATHS[type])) {
            fs.mkdirSync(PATHS[type]);
        }
        return path.join(PATHS[type], fileName);
    } catch (err) {
        console.error(err);
    }
}

const createFileName = (videoTitle, fileType) => {
    const videoName = `${getValidFileName(videoTitle)}.${fileType}`;
    return videoName;
}

const getFullDownloadPath = (videoTitle, downloadType) => {
    if (TYPES[downloadType.pathType]) {
        const fileName = createFileName(videoTitle, downloadType.extention);
        const fullPath = checkFoldersAndReturnThePath(fileName, downloadType.pathType);
        return fullPath;
    } else {
        throw new Error('not valid download type');
    }
}


module.exports = {
    getFullDownloadPath, TYPES
}