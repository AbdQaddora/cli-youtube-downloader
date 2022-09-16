#! /usr/bin/env node

// build in modules 
const fs = require('fs');
// external modules
const term = require('terminal-kit').terminal;

// my modules
const { download } = require('./download');

const argv = process.argv.slice(2);

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
// link , argv , the terminal animation
download(argv[0], argvAsObject(argv.slice(1)), animation);

