/**
 * Created by cool.blue on 7/28/2016.
 *
 * read stream emits <readable> twice
 *
 * Usage: node testFile [-i][-r n][-n][-t x][-f]
 *  -r is for n repeats (default 0)
 *  -i is to force immediate read without waiting for <readable>.
 *  -n to not read after <readable>
 *  -t read after x msec
 *  -f apply fix by adding and extra stream.read(1)
 */
const fs = require('fs');
const logEvents = require('@cool-blue/logevents')();

const commandLineArgs = require('command-line-args');
const optionDefinitions = [
    {name: 'not-on-readable', alias: 'n', type: Boolean},
    {name: 'immediate', alias: 'i', type: Boolean},
    {name: 'repeats', alias: 'r', type: Number, defaultValue: 0},
    {name: 'timer', alias: 't', type: Number, defaultValue: 0},
    {name: 'fix', alias: 'f', type: Boolean}
];
const options = commandLineArgs(optionDefinitions);

const now = require('moment');
var specs = {
        inFile: './input.txt',
        Stream: function() {

            // create a new stream.Readable object connected to the input file
            var _stream = fs.createReadStream(this.inFile);
            console.log(`${stamp()}read stream created`);

            // log events from the Stream
            var streamEvents = ['pipe', 'unpipe', 'finish', 'cork', 'close', 'drain', 'error', 'end', 'readable'];
            logEvents.open((_stream.name = "stream", _stream), streamEvents);

            // return the monitored Stream
            return _stream
        },
    },
    body, stream, result;

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

function logit(context, delay) {
    delay = delay || 0;
    function _main() {
        result = stream.read();
        console.log(`\n${stamp()}${context}:\n${ESC}${WHITE}m${result}${ESC}m`)
    }

    if(delay) return setTimeout(_main, delay);
    return _main();
}

function main(repeats) {

    console.log(`\n${ESC}${BOLD};${RED}m${stamp()}starting main: ${repeats}${ESC}m`);

    // connect a readstream to the same file
    stream = specs.Stream();

    // try to read it
    if(options.immediate)
        logit(`immediate`, 0);

    if(options.timer)
        logit(`after timeout`, options.timer);

    if(!options["not-on-readable"])
        stream.once('readable', (() => {
            console.log(`${stamp()}setting listener on readable`);
            var count = 0;
            return () => {
                logit(`after readable:\t${++count}`, 0);
                if(repeats)
                    stream.on('close', main.bind(this, --repeats))
            }
        })());
    else
        main.bind(this, --repeats);

    console.log(`${ESC}${BOLD};${RED}m${stamp()}ending main: ${repeats}${ESC}m\n`);
}

main(options.repeats);