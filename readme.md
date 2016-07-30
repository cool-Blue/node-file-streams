### Chaining a read to a file that has been written
####  Objective
  1.  Delete inFile if it exists
  2.  Create a new version with the same name and write content to it
  1.  Read the content from the file
  1.  After the read is complete and the file is no longer needed, go back and repeat from the start.
    
#### Considerations
The file needs to be in a closed state before it can be re-opened.
The `stream.Readable` object returned by `fs.createReadStream` will emit `readable` events each time new data is available to read.  In windows, the buffer is limited to 64k bytes so this will be the maximum size of the chunks returned by `stream.Readable.read`.  After all of the contents have been read by calls to `#.read`, the stream will emit the `end` then `close` events.

####  Approach
The readable callback needs to `read` the stream and accumulate the data as it is delivered.  We can also add a listener to the `close` event and call back with the stream bound as `this` and pass the accumulated file contents as an argument.

    function readIt(stream, context, next) {
        var body = "";
    
        stream
            .on('readable', (() => {
                console.log(`${stamp()}setting listener on readable`);
                var count = 0;
                return (fromlogit) => {
                    var chunk;
                    body += stream.read();
                    console.log(`read ${body.length} bytes:\t${++count}\t${context}`);
                }
            })())
            .on('close', (() => {
                console.log(`${stamp()}setting listener on close`);
                return function(){
                    console.log(`${stamp()}callback from close\t${context}`);
                    next.bind(stream)(body)
                }
            })());
    
        return stream;
    }
    
### [GIT Repo with complete working example](https://github.com/cool-Blue/node-file-streams)