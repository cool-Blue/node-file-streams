/**
 * Created by cool.blue on 7/28/2016.
 *
 * read stream emits <readable> twice
 *
 * Usage: node testFile [-i][-r n][-n][-t x][-f]
 *  -r is for n repeats (default 0)
 */
const fs = require('fs');
const logEvents = require('@cool-blue/logevents')();

const commandLineArgs = require('command-line-args');
const optionDefinitions = [
    {name: 'repeats', alias: 'r', type: Number, defaultValue: 0}
];
const options = commandLineArgs(optionDefinitions);

const now = require('moment');
var specs = {
        inFile: './input.txt',
        Stream: function() {

            // create a new stream.Readable object connected to the input file
            var _stream = fs.createReadStream(this.inFile);
            console.log(`${stamp()}read stream created`);

            //bind the reader
            _stream.readAll = readAll;

            // log events from the Stream
            var streamEvents = ['pipe', 'unpipe', 'finish', 'cork', 'close', 'drain', 'error', 'end', 'readable'];
            logEvents.open((_stream.name = "stream", _stream), streamEvents);
            console.log(`${stamp()}listeners bound`);

            // return the monitored Stream
            return _stream
        },
    };

var content = ["capture-this!", "日本語", "-k21.12-0k-ª–m-md1∆º¡∆ªº"];
var stamp = () => `${now(Date.now()).format("HH:mm:s:SSSS")}\t`;
var ESC    = '\x1b[',
    gEND   = "m",
    allOFF = `${ESC}0m`,
    BOLD   = '1',
    REV    = '7',
    WHITE  = '37',
    RED    = '31',
    GREEN  = '32',
    YELLOW = '33',
    BLUE   = '34';

function reset(inFile, content) {

    console.log(`${ESC}${BOLD};${BLUE}m${stamp()}delete and re-write inFile${ESC}m`);
    var _content, _body;

    //delete the file if it exists
    try {
        fs.unlinkSync(inFile);
    } catch(e) {
        // just ignore it
        console.warn("WARNING: inFile does not exist")
    }
    //and rewrite the original content to it
    _content = content.reduce(function(res, line) {
        return res + line + "\n";
    }, "");
    _body = Array(20000).fill(_content).reduce(function(res, e, i){
        return `${res}\n${i} ${e}`
    }, "");
    fs.writeFileSync(inFile, _body);

    //return the file content for reference
    return _content;
}

function readAll(context, next) {
    var stream = this;
    var body = "";

    function readChunk (fromreadit) {
        var chunk;
        chunk = stream.read();
        body += chunk;
        console.log(`read ${chunk ? chunk.length : 0} bytes:\t${context}`);
    }
    function onClose(fromreadit){
        console.log(`${stamp()}callback from close\t${context}`);
        next.bind(stream)(body)

        this.removeListener('readable', readChunk);
        this.removeListener('close', onClose);
    }

    stream
        .on('readable', (() => {
            console.log(`${stamp()}setting listener on readable`);
            return readChunk
        })())
        .on('close', (() => {
            console.log(`${stamp()}setting listener on close`);
            return onClose
        })());

    return stream;
}

function main(repeats) {

    var startTime = stamp(),
        body, stream, result;

    console.log(`\n${ESC}${BOLD};${RED}m${startTime}starting main: ${repeats}${ESC}m`);

    // prime the input file and return it's contents
    body = reset(specs.inFile, content);

    // connect a readstream to the same file
    stream = specs.Stream();

    // try to read it
    stream.readAll(`main ${startTime}`, function(result){
        console.log(`\n${stamp()}result:${ESC}${WHITE}m${result ? result.length : 0} bytes read${ESC}m${ESC}1A`);
        if(repeats)
            main(--repeats)
    });

    console.log(`${ESC}${BOLD};${RED}m${stamp()}ending main: ${repeats}${ESC}m\n`);

}

main(options.repeats);