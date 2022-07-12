const CompilerError = require('./errors.js');
const fs = require('fs');
const chalk = require('chalk');

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

module.exports = { Compile, Decompile };