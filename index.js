const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const externalUrl = process.env.RENDER_EXTERNAL_URL;
const PORT = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4090;
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.render('index');
});

if (externalUrl) {
    const hostname = '0.0.0.0';
    app.listen(PORT, hostname, () => {
        console.log(`Server locally running at http://${hostname}:${PORT}/ and from outside on ${externalUrl}`);
    });
} else {
    https.createServer({
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert')
    }, app)
        .listen(PORT, function () {
            console.log(`Server running at https://localhost:${PORT}/`);
        });
}