/**
 * Created by Admin on 7/28/2016.
 */
var fs     = require('fs');
var logEvents = require('@cool-blue/logevents')();
const now = require('moment');
var specs = {
        inFile: './test/fixtures/input.txt',
        stream: function() {
            var _stream = fs.createReadStream(this.inFile);
            console.log(`${stamp()}read stream created`)
            // log events from the stream
            var streamEvents = ['pipe', 'unpipe', 'finish', 'cork', 'close', 'drain', 'error', 'end', 'readable'];
            logEvents.open((_stream.name = "stream", _stream), streamEvents);
            // return the monitored stream
            return _stream
        },
    },
    body, stream, result;

var content = ["capture-this!", "日本語", "-k21.12-0k-ª–m-md1∆º¡∆ªº"];
var stamp = () => `${now(Date.now()).format("HH:mm:s:SSSS")}\t`;
var ESC = '\x1b[',
    gEND = "m",
    allOFF = `${ESC}0m`,
    BOLD = '1',
    REV = '7',
    WHITE = '37',
    RED = '31',
    GREEN = '32',
    YELLOW = '33',
    BLUE = '34';

function reset(inFile, content){

    console.log(`${ESC}${BOLD};${BLUE}m${stamp()}reset${ESC}m`);
    var _content;

    //reset the test input
    try {
        fs.unlinkSync(inFile);
    } catch(e) {
        // just ignore it
        console.warn("WARNING: inFile does not exist")
    }

    _content = content.reduce(function(res, line) {
        return res + line + "\n";
    }, "");
    fs.writeFileSync(inFile, _content);

    //return the file content for reference
    return _content;
}

function logit (context, delay) {
    delay = delay || 0;
    function _main(){
        result = stream.read();
        stream.read(0);
        console.log(`\n${stamp()}${context}:\n${ESC}${WHITE}m${result}${ESC}m`)
    }
    if(delay) return setTimeout(_main, delay);
    return _main();
}

function main(repeats) {
    console.log(`\n${ESC}${BOLD};${RED}m${stamp()}starting main${ESC}m`);
    // prime the input file and return it's contents
    body = reset(specs.inFile, content);

    // connect a readstream to the same file
    stream = specs.stream();

    // try to read it
    /*
     logit("immediate"); // null

     logit('after timeout', 100);    // null if it happens after readable

     stream.on('readable', () => {
     logit('after readable + 0', 0); // success unless timeout happens first
     });
     */

    stream.on('readable', () => {
        logit(`after readable: ${repeats}`, 0);
        if (repeats) stream.on('close', main.bind(this, --repeats))
    });
    console.log(`\n${ESC}${BOLD};${RED}m${stamp()}ending main${ESC}m`);
}

main(0);