const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const path = require('path');

serveAlbumFiles = (req,res) => {
    let allData = "";
    req.on("data", function (data) {
        allData += data;
    })
    req.on("end", function (data) {
        let album = decodeURIComponent(allData.split("=")[1]).split("+").join(" ")
        const albumPath = path.join(__dirname, `/static/mp3/${album}`);
        fs.readdir(albumPath, (err, files) => {
            if (err) throw err
            const albumFiles = [];
            files.forEach(file => {
                const stats = fs.statSync(path.join(__dirname, `/static/mp3/${album}`, file));
            
                if (file.includes(".mp3")) albumFiles.push({ file: file, size: stats.size,album:album });
            })
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.writeHead(200, { "content-type": "text/html;charset=utf-8" });
         
            res.end(JSON.stringify({
                files: albumFiles,
            }));
        });
    })
}


const server = http.createServer(function (req, res) {

    if (req.url.includes(".mp3")) {
        let filename = decodeURIComponent(req.url);
        console.log("filename",filename)
        console.log(path.join(__dirname,filename))
        fs.readFile(path.join(__dirname,filename) , function (error, data) {
            res.writeHead(200, { "Content-type": "audio/mpeg" });
            res.write(data);
            res.end();
         })
    }

    if (req.url.includes(".jpg") || req.url.includes(".png")) {
        let filename = decodeURIComponent(req.url);
        console.log(filename)
        try {
            fs.readFile(path.join(__dirname, filename), (err, data) => {
                res.writeHead(200, { 'content-type': 'image/jpeg' })
                res.write(data)
                res.end()
            })
        }
        catch (error) {
            console.log(error)
        }
    }

    if (req.method == "GET") {

    }
    else if (req.method == "POST") {
      
        if (req.url == "/first") {
            fs.readdir(path.join(__dirname, "/static/mp3"), (err, dirs) => {
                if (err) throw err
                const albumFiles = [], albums = [];
                dirs.forEach((dir) => albums.push(dir));
                fs.readdir(path.join(__dirname, `/static/mp3/${albums[0]}`), (err, files) => {
                    files.forEach((albumFile) => {
                        const stats = fs.statSync(path.join(__dirname, `/static/mp3/${albums[0]}`, albumFile));
                        if (albumFile.includes(".mp3")) albumFiles.push({ file: albumFile, size: stats.size,album:albums[0] });

                    })
                    res.setHeader("Access-Control-Allow-Origin", "*");
                    res.writeHead(200, { "content-type": "text/html;charset=utf-8" });
                    res.end(JSON.stringify({
                        albums: albums,
                        files: albumFiles,
                    }));
                })

            });
        }
        if (req.url == "/next") {
                serveAlbumFiles(req,res)
        }

    }
})

server.listen(3000, function () {
    console.log(`Server listening on port ${3000}`);
})