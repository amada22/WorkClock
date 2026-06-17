const https = require("https");
const fs = require("fs");
const next = require("next");

const app = next({ dev: true });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("./10.0.0.32+2-key.pem"),
  cert: fs.readFileSync("./10.0.0.32+2.pem"),
};

app.prepare().then(() => {
  https.createServer(httpsOptions, (req, res) => {
    handle(req, res);
  }).listen(3000, "0.0.0.0", () => {
    console.log("HTTPS running on https://10.0.0.32:3000");
  });
});