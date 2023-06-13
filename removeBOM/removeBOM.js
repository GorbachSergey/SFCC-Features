
var File = require('dw/io/File');
var FileWriter = require('dw/io/FileWriter');
var FileReader = require('dw/io/FileReader');
var Bytes = require('dw/util/Bytes');
var MAX_READ_CHARS = 10240;

function isContainBOM(file) {
    var fileReader = new FileReader(file, 'utf-8');
    var result = false;
    var content = Encoding.toHex(new Bytes(fileReader.readN(1)));

    if ('efbbbf'.equalsIgnoreCase(content)) {
        result = true;
    }

    fileReader.close();

    return result;
}

function removeBOM(file, sourceFolder) {
    var temporaryModifiedFile = new File(sourceFolder, 'temp_' + file.getName());
    var fileWriter = new FileWriter(temporaryModifiedFile, 'utf-8');
    var fileReader = new FileReader(file, 'utf-8');
    var bytesToCopy = file.length() - 1;
    var buffer;
    fileReader.readN(1); // Skip BOM bytes

    do {
        if (bytesToCopy > MAX_READ_CHARS) {
            buffer = fileReader.readN(MAX_READ_CHARS);
            bytesToCopy = bytesToCopy - MAX_READ_CHARS;
        } else {
            buffer = fileReader.readN(bytesToCopy);
            bytesToCopy = 0;
        }
        if (buffer !== null) {
            fileWriter.write(buffer);
        }
    } while (bytesToCopy !== 0);

    fileReader.close();
    fileWriter.flush();
    fileWriter.close();

    return temporaryModifiedFile;
}

// USAGE
var file = new File(File.IMPEX + File.SEPARATOR + 'YOUR_FILE');

if (isContainBOM(file)) {
    var fileWithoutBOM = removeBOM(file, dir);
    fileWithoutBOM.renameTo(file);
}