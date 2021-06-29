const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const url = require('url');

var server = http.createServer(handleRequest);

function handleRequest(req,res){
    var store = "";
    var parsedURL = url.parse(req.url,true);
    req.on('data', (chunk)=>{
        store += chunk;
    })
    req.on('end', ()=>{
        if(req.method === 'GET' && req.url === '/'){
            res.setHeader('Content-Type', 'text/html');
            fs.createReadStream(__dirname + '/index.html').pipe(res)
        }
        else if(req.method === 'GET' && req.url === '/about'){
            res.setHeader('Content-Type', 'text/html');
            fs.createReadStream(__dirname + '/about.html').pipe(res)
        } 
        else if(req.url.split('.').pop() === 'png'){
            // console.log('HI');
            res.setHeader('Content-Type', `image/${req.url.split(".").pop()}`);
            fs.createReadStream(__dirname + req.url).pipe(res);
        }
        else if(req.url.split('.').pop() === 'css'){
            res.setHeader('Content-Type', 'text/css');
            fs.createReadStream(__dirname + req.url).pipe(res);
        }
        else if(req.method === 'GET' && req.url === '/contact'){
            res.setHeader('Content-Type', 'text/html');
            fs.createReadStream(__dirname + '/contact.html').pipe(res);
        }
        else if(req.method === 'POST' && req.url === '/form'){
            const contactPath = __dirname + '/contacts/'
            let parsedData = qs.parse(store);

            fs.open(contactPath + parsedData.username + '.json', 'wx', (err,file)=>{
                if(err) return res.end('username taken');
                fs.writeFile(file,store,(err)=>{
                    if(err) return console.log(err);

                    fs.close(file, (err)=>{
                        if(err) return console.log(err);
                        res.end('contacts saved')
                    })
                })
            })
        }
        else if(req.method === 'GET' && parsedURL.pathname === '/users'){
            console.log(__dirname +'/contacts/'+parsedURL.query.username+'.json')
            fs.readFile(__dirname +'/contacts/'+parsedURL.query.username+'.json', (err, user)=>{
                if(err) return console.log(err);

                let stringifiedData = qs.parse(user.toString());
                res.write(`<h1>${stringifiedData.fname}</h1>`);
                res.write(`<p>${stringifiedData.email}</p>`);
                res.write(`<p>${stringifiedData.username}</p>`);
                res.write(`<p>${stringifiedData.age}</p>`);
                res.write(`<p>${stringifiedData.bio}</p>`);
                res.end();
            })
        }
    })
}

server.listen(5000, ()=>{
    console.log("Server is listening at 5k");
})