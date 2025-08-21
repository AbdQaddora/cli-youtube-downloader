#! /usr/bin/env node

// build in modules 
const fs = require('fs');
// external modules
const term = require('terminal-kit').terminal;

// my modules
const { download } = require('./download');

const argv = process.argv.slice(2);

// Validate input
if (argv.length === 0 || argv[0] === '--help') {
    console.log('Usage: abdyts <youtube-url> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --audio              Download audio only');
    console.log('  --hd1080             Download in 1080p quality');
    console.log('  --hd720              Download in 720p quality');
    console.log('  --l480               Download in 480p quality');
    console.log('  --m360               Download in 360p quality');
    console.log('  --s240               Download in 240p quality');
    console.log('  --t144               Download in 144p quality');
    console.log('  --help               Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  abdyts https://youtu.be/VIDEO_ID');
    console.log('  abdyts https://youtu.be/VIDEO_ID --hd720');
    console.log('  abdyts https://youtu.be/VIDEO_ID --audio');
    process.exit(0);
}

// Validate YouTube URL
const youtubeUrl = argv[0];
if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
    console.error('Error: Please provide a valid YouTube URL');
    console.error('Supported formats:');
    console.error('  - https://www.youtube.com/watch?v=VIDEO_ID');
    console.error('  - https://youtu.be/VIDEO_ID');
    process.exit(1);
}

// to run an animation in the terminal
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

const argvAsObject = (argv) => {
    const argvObject = {}
    argv.forEach(element => {
        argvObject[element] = element;
    });
    return argvObject;
}

// Add error handling for the main process
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error.message);
    console.error('This might be due to YouTube restrictions or network issues.');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// link , argv , the terminal animation
try {
    download(youtubeUrl, argvAsObject(argv.slice(1)), animation);
} catch (error) {
    console.error('Error starting download:', error.message);
    process.exit(1);
}

