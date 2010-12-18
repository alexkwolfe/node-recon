recon
=====

Keep your network connections alive in node.js no matter what.
Recon looks like a regular tcp connection but it listens for disconnect events
and tries to re-establish the connection behind the scenes. While the connection
is down, `write()` returns `false` and the data gets buffered. When the
connection comes back up, recon emits a `drain` event.

Examples
========

stayin_alive.js
---------------
    var recon = require('recon');
    var conn = recon(4321);
    
    conn.on('data', function (buf) {
        var msg = buf.toString().trim()
        console.log(msg);
    });

then fire up stayin_alive.js:
    $ node stayin_alive.js

and then you can listen on port 4321 with netcat, type some stuff, kill netcat,
and fire it up again to type some more stuff:
    $ nc -lp 4321
    nc: using stream socket
    everybody stop
    ^C
    $ nc -lp 4321
    nc: using stream socket
    hammertime
    ^C

and meanwhile stayin_alive.js didn't skip a beat:
    $ node stayin_alive.js 
    everybody stop
    hammertime

Usage
=====

recon(port)
-----------
recon(port, host, cb, kwargs={})
--------------------------------

Create a connection. The arguments can be specified in `kwargs` or wherever in
arguments list and are optional except port. `cb` is a function that gets the
raw `Stream` object each time a new connection happens for tacking on methods
like `.setNoDelay()`.

write(msg)
----------

Like `stream.write`, but buffers data while the module is reconnecting.

end()
-----
end(msg)
--------

Terminate the connection (and don't reconnect).

Events
======

Event: data
-----------
Event: drain
------------

Just like stream.

Event: connect
--------------

Emitted only the first time the connection is established.

Event: reconnect
----------------

Emitted each time the module establishes a connection after the first time.

Event: error(err)
-----------------

Just like stream, unless `err.errno` is 111 (ECONNREFUSED), in which case the
error gets eaten and recon reconnects behind the scenes.
