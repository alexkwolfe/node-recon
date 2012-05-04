var recon = require('recon');
var test = require('tap').test;
var net = require('net');

test('buffered write', function (t) {
    var port = Math.floor(10000 + Math.random() * (Math.pow(2,16) - 10000));
    
    var cb_count = 0;
    var conn = recon(port, function (c) {
        t.ok(c instanceof net.Stream);
        cb_count ++;
    });
    var bufs = [];
    
    conn.on('data', function (buf) {
        bufs.push(buf.toString());
        setTimeout(function () {
            conn.write(buf);
            if (buf.toString() == 'end') {
                conn.end();
                t.same(bufs, [ 'pow!', 'end' ]);
            }
        }, 25);
    });
    
    var events = [];
    
    conn.on('connect', function () {
        events.push('connect');
    });
    
    conn.on('drop', function () {
        events.push('drop');
    });
    
    conn.on('reconnect', function () {
        events.push('reconnect');
        
        t.same(events, [ 'connect', 'drop', 'reconnect' ]);
    });
    
    setTimeout(function () {
        var server1 = net.createServer(function (stream) {
            stream.write('pow!');
            stream.destroy();
            server1.close();
            t.end();
            
            stream.on('data', function () {
                t.fail('wrote before it was supposed to');
            });
        });
        server1.listen(port);
        
        server1.on('close', function () {
            setTimeout(function () {
                var server2 = net.createServer(function (stream) {
                    stream.write('end');
                    var recv = [];
                    stream.on('data', function (buf) {
                        recv.push(buf.toString());
                    });
                    
                    setTimeout(function () {
                        conn.destroy();
                        stream.destroy();
                        server2.close();
                        t.same(recv, [ 'pow!', 'end' ]);
                        t.equal(cb_count, 3);
                    }, 50);
                });
                server2.listen(port);
            }, 100);
        });
    }, 100);
});
