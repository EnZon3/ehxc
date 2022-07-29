const CompilerError = require('./errors.js');
const fs = require('fs');
const chalk = require('chalk');

function qcCheck(){
    //Checks if Quick Compile setting is enabled
    const config = fs.readFileSync('./ehxconf', 'utf8');
    if (config.includes('-qc')) {
        return true;
    }
    //if no file is found, assume it is disabled
    return false;
}

function Compile(fileLoc, out) {
    if(!fileLoc) {
        CompilerError.NoInputFileException('No input file specified');
    }
    if(!out) {
        CompilerError.NoOutputFileException('No output file specified');
    }
    if(!fs.existsSync(fileLoc)) {
        CompilerError.NonExistentInputFileException(`Input file '${fileLoc}' does not exist`);
    }
    if(qcCheck() === true) {
        console.log(chalk.yellow('»» Quick Compile enabled'));
        //get chunk size from config file
        const config = fs.readFileSync('./ehxconf', 'utf8');
        const configArr = config.split('--');
        const chunkSize = configArr[1];
        quickCompile(fileLoc, out, chunkSize);
        return;
    } else {
        console.log(chalk.yellow('»» Quick Compile disabled'));
    }
    const hex = fs.readFileSync(fileLoc, 'utf8');
    const hexFiltered = hex.replace(/\s/g, '').replace(/\n/g, '');
    console.log(chalk.green(`«« Parsed ${hexFiltered.length / 2} hex bytes`));
    const splitHex = hexFiltered.match(/.{1,2}/g);
    //check if length is 0
    if(splitHex === null) {
        CompilerError.IncorrectHexFormattingException('No hex characters found');
    }
    //hex regex that allows for lowercase hex
    const hexRegex = /^[a-fA-F0-9]+$/;
    //test individual hex bytes
    for(let i = 0; i < splitHex.length; i++) {
        if(!hexRegex.test(splitHex[i])) {
            CompilerError.InvalidHexCharacterException(`Invalid hex byte '${splitHex[i]}'`);
        }
    }
    console.log(chalk.green(`«« Input file is valid`));
    //convert to byte arr
    const byteArr = Buffer.from(hexFiltered, 'hex');
    console.log(chalk.green(`«« Converted to byte array`));
    //write to file
    try {
        fs.writeFileSync(out, byteArr);
    }
    catch(err) {
        CompilerError.OutputFileWriteException(err.message);
    }
    console.log(chalk.green(`»» Compiled ${fileLoc} to ${out}`));
}

function Decompile(fileLoc, out) {
    if(!fileLoc) {
        CompilerError.NoInputFileException('No input file specified');
    }
    if(!out) {
        //default to same name as input file but ends with .bin
        out = fileLoc.substring(0, fileLoc.length - 3) + 'bin';
        //tell user about default output file
        console.log(chalk.yellow(`»» No output file specified, defaulting to ${out}`));
    }
    if(!fs.existsSync(fileLoc)) {
        CompilerError.NonExistentInputFileException(`Input file '${fileLoc}' does not exist`);
    }
    const byteArr = fs.readFileSync(fileLoc, 'hex');
    const hex = byteArr.toString();
    //space every 2 bytes, newline every 33 bytes
    const hexFormatted = hex.match(/.{1,2}/g).join(' ');
    const spacedHex = hexFormatted.match(/.{1,33}/g).join('\n');
    console.log(chalk.green(`«« Converted to hex`));
    //write to file
    try {
        fs.writeFileSync(out, spacedHex);
    }
    catch(err) {
        CompilerError.OutputFileWriteException(err.message);
    }
    console.log(chalk.green(`»» Decompiled ${fileLoc} to ${out}`));
}

function quickCompile(fileLoc, out, config) {
    const hex = fs.readFileSync(fileLoc, 'utf8');
    config = parseInt(config);
    console.log(chalk.green(`»» Chunk size: ${config}`));
    let hexArr;
    //split every n bytes
    if(config === 1) {
        //don't split and return 0
        console.log(chalk.red('»» Chunk size is 1, Quick Compile is useless with this chunk size and the program will now exit'));
        return 0;
    }

    //split every 3 * n bytes
    let charSplit = config * 3;

    //create regex to split on
    const regex = new RegExp(`.{1,${charSplit}}`, 'g');

    //create an chunked array using the hex var and the chunk size
    hexArr = hex.match(regex);
    //check if length is 0
    if(hexArr === null) {
        CompilerError.IncorrectHexFormattingException('No hex characters found');
    }

    //parse each chunk
    for(let i = 0; i < hexArr.length; i++) {
        hexArr[i] = hexArr[i].replace(/\s/g, '').replace(/\n/g, '');
        //hex regex that allows for lowercase hex
        const hexRegex = /^[a-fA-F0-9]+$/;
        //test individual hex bytes
        if(!hexRegex.test(hexArr[i])) {
            CompilerError.InvalidHexCharacterException(`Invalid hex byte '${hexArr[i]}'`);
        }
    }
    console.log(chalk.green(`«« Parsed and verified ${hexArr.length} chunks`));
    //convert to byte arr
    const byteArr = Buffer.from(hexArr.join(''), 'hex');
    console.log(chalk.green(`«« Converted to byte array`));
    //write to file
    try {
        fs.writeFileSync(out, byteArr);
    }
    catch(err) {
        CompilerError.OutputFileWriteException(err.message);
    }
    console.log(chalk.green(`»» Compiled ${fileLoc} to ${out}`));
}

module.exports = { Compile, Decompile };