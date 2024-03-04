const express = require('express');
const https = require('https');
const fs = require('fs');
const studentsRouter = require('./routes/students');

const app = express();
app.use(express.json());

const httpsOptions = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
};

app.use('/students', studentsRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Hello World!',
    ...getClientInfo(req)
  });
});

const server = https.createServer(httpsOptions, app);

server.listen(8080, () => {
  console.log('HTTPS server running on port 8080');
});

function getClientInfo(req) {
  return {
    IP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    deviceType: req.headers['user-agent'],
};
}