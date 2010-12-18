var net = require('net');
var EventEmitter = require('events').EventEmitter;

exports = module.exports = function recon () {
    var params = parseArgs(arguments);
    var self = new EventEmitter;
    
    var conn = null;
    var connected = false;
    var alive = true;
    var buffer = [];
    var connections = 0;
    
    self.write = function (msg) {
        if (connected) {
            return conn.write(msg);
        }
        else {
            buffer.push(msg);
            return false;
        }
    };
    
    self.end = function (msg) {
        if (msg !== undefined) self.write(msg);
        alive = false;
        connected = false;
        conn.end();
    };
    
    self.destroy = function () {
        alive = false;
        connected = false;
        conn.destroy();
    };
    
    (function connect () {
        conn = net.createConnection(params.port, params.host);
        if (params.cb) params.cb(conn);
        
        conn.on('data', self.emit.bind(self, 'data'));
        conn.on('drain', self.emit.bind(self, 'drain'));
        
        conn.on('connect', function () {
            self.emit(connections === 0 ? 'connect' : 'reconnect');
            connections ++;
            connected = true;
            
            var buffered = buffer.length > 0;
            var ok = true;
            buffer.forEach(function (msg) {
                var wrote = self.write(msg);
                ok = ok && wrote;
            });
            buffer = [];
            
            if (buffered && ok) self.emit('drain');
        });
        
        conn.on('error', function (err) {
            if (err.errno === 111) {
                self.emit('retry');
                setTimeout(connect, params.retry || 1000);
            }
            else self.emit('error', err);
        });
        
        conn.on('end', function () {
            connected = false;
            setTimeout(connect, params.retry || 1000);
        });
    })();
    
    return self;
};

exports.parseArgs = parseArgs;
function parseArgs (argv) {
    var args = [].slice.call(argv);
    var params = {};
    args.forEach(function (arg) {
        if (typeof arg === 'string') {
            if (arg.match(/^\d+$/)) {
                params.port = arg;
            }
            else {
                params.host = arg;
            }
        }
        else if (typeof arg === 'number') {
            params.port = arg;
        }
        else if (typeof arg === 'function') {
            params.cb = arg;
        }
        else if (typeof arg === 'object' && arg !== null) {
            Object.keys(arg).forEach(function (key) {
                params[key] = arg[key];
            });
        }
    });
    params.port = parseInt(params.port, 10);
    return params;
};
