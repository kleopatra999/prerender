var prerender = require('./lib')
var AWS = require('aws-sdk');
var config = {};
try {
    config = require('./config');
} catch (e) {
    console.warn("No config found")
}


// Setup AWS credentials
if (config.aws) {
    var credentials = new AWS.Credentials(config.aws.key, config.aws.secret);
    AWS.config.update({
        credentials: credentials,
        region: config.aws.region
    });
    process.env.S3_BUCKET_NAME = config.aws.bucket;    
}

var server = prerender({
    workers: process.env.PHANTOM_CLUSTER_NUM_WORKERS,
    iterations: process.env.PHANTOM_WORKER_ITERATIONS || 10,
    phantomArguments: ["--load-images=false", "--ignore-ssl-errors=true"],
    phantomBasePort: process.env.PHANTOM_CLUSTER_BASE_PORT,
    messageTimeout: process.env.PHANTOM_CLUSTER_MESSAGE_TIMEOUT
});

// server.use(prerender.whitelist());
server.use(prerender.blacklist());
// server.use(prerender.logger());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());
// server.use(prerender.inMemoryHtmlCache());
server.use(prerender.s3HtmlCache());

server.start();
