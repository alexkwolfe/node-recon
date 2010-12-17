recon
=====

Keep your network connections alive in node.js no matter what.
Recon looks like a regular tcp connection but it listens for disconnect events
and tries to re-establish the connection behind the scenes. While the connection
is down, `write()` returns `false` and the data gets buffered. When the
connection comes back up, recon emits a `drain` event.

Examples
========



Usage
=====

recon(port, host='127.0.0.1', options={})
-----------------------------------------

Create a connection

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
