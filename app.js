const { error } = require("console");
const http = require("http");
const https = require("https");
const url = "https://time.com";
const fs = require('fs');

const handleTimeStoriesRequest = (req, res) => {
  if (req.method === "GET" && req.url === "/getTimeStories") {
    https
      .get(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          const element =
            /<li class="latest-stories__item">\s*<a href="([^"]+)">\s*<h3 class="latest-stories__item-headline">([^<]+)<\/h3>/g;
          const array = [];
          let object;

          while ((object = element.exec(data)) !== null) {
            array.push({
              title: object[2],
              link: `https://time.com${object[1]}`,
            });
          }

          const responseData = array.slice(0, 6);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(responseData));
        });
      })
      .on("error", (error) => {
        console.error(error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      });
  } else {
    handleDefaultRequest(req, res);
  }
};

const handleDefaultRequest = (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    serveStaticFile('index.html', res);
  } else {
    // Default case for any other routes
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
};

const serveStaticFile = (filename, res) => {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    }
  });
};

const server = http.createServer((req, res) => {
  handleTimeStoriesRequest(req, res);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
