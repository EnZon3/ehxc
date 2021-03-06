#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const chalk = require('chalk');
const Compiler = require('./compiler/Compiler.js')
const fs = require('fs');
const license = require('./extra/license.js');

program
    .name('EHxC')
    .description('EHxC (Extended Hex Compiler): Write hex in a plain text file and compile it straight to machine code! \n\n' + license.notice)
    .version('1.3.1');

program.command('warranty')
    .description('Shows the warranty information')
    .action(() => {
        console.log(license.warranty);
    });

program.command('cond')
    .description('Shows the license conditions')
    .action((str, options) => {
        console.log(license.conditions);
    });

program.command('c')
    .description('Compiles a .ehx file to machine code')
    .argument('<file>', 'file to compile')
    .option('--out <output>', 'output file location')
    .action((str, options) => {
        console.log(chalk.green(`»» Compiling ${str}`));
        Compiler.Compile(str, options.out);
    });

program.command('d')
    .description('Decompiles a file to stringified hex')
    .argument('<file>', 'file to decompile')
    .option('--out <output>', 'output file location')
    .action((str, options) => {
        Compiler.Decompile(str, options.out);
    });

program.command('build')
    .description('Compile command but arguments are read from a config file instead of command line Config file format: <file> [newline] <output>')
    .action(() => {
        //read config file
        const ehxconfig = fs.readFileSync('./ehxconf', 'utf8').split('\n');
        //get rid of '\r'
        ehxconfig.forEach((line, i) => {
            ehxconfig[i] = line.replace('\r', '');
        }
        );
        //check if config file is empty
        if(ehxconfig === null) {
            console.log(chalk.red('»» Config file is empty'));
            return;
        }
        //check if config file is valid
        if(ehxconfig.length < 2) {
            console.log(chalk.red('»» Config file is invalid'));
            return;
        }
        console.log(chalk.green(`»» Compiling ${ehxconfig[0]}`));
        Compiler.Compile(ehxconfig[0], ehxconfig[1]);
    });

program.parse();