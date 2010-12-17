var recon = require('recon');
var conn = recon(4321);

conn.on('data', function (buf) {
    var msg = buf.toString().trim()
    console.log(msg);
});
