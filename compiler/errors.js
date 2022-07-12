const chalk = require('chalk');

function IncorrectHexFormattingException(message) { throw new Error(chalk.red(`»» IncorrectHexFormattingException: ${message}`)); }
function InvalidHexCharacterException(message) { throw new Error(chalk.red(`»» InvalidHexCharacterException: ${message}`)); }
function NoInputFileException(message) { throw new Error(chalk.red(`»» NoInputFileException: ${message}`)); }
function NonExistentInputFileException(message) { throw new Error(chalk.red(`»» NonExistentInputFileException: ${message}`)); }
function OutputFileWriteException(message) { throw new Error(chalk.red(`»» OutputFileWriteException: ${message}`)); }

module.exports = {
    IncorrectHexFormattingException,
    InvalidHexCharacterException,
    NoInputFileException,
    NonExistentInputFileException,
    OutputFileWriteException
}