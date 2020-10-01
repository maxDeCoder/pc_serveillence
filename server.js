const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs");
const busboy = require("connect-busboy");
const http = require("http");
const socketio = require("socket.io");

var node_list = [];

app.use(busboy());
const port = process.env.PORT || 80;
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "1mb" }));
app.listen(port, () => {
  console.log("listening to port : ", port);
  console.log("server started");
});
var mime = {
  html: "text/html",
  txt: "text/plain",
  css: "text/css",
  gif: "image/gif",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  js: "application/javascript"
};

app.get("/", (req,res)=>{
  res.send("fuck off");
})

app.post("/python/", (req, res) => {
  console.log("new file coming in");
  req.pipe(req.busboy);
  req.busboy.on("file", function(fieldname, file, filename) {
    console.log("Uploading: " + filename);
    var fstream;
    var endLoc = "/images/" + filename;
    var writeDir = path.join(__dirname, endLoc);
    fstream = fs.createWriteStream(writeDir);
    file.pipe(fstream);
    fstream.on("close", function() {
      console.log("saved");
      res.send("i got it");
    });
  });
});

app.get("/images/:filename/:key", (req, res) => {
  if (req.params.key == process.env["GLOBAL_KEY"]) {
    const filename = req.params.filename;
    var fstream = fs.createReadStream(
      path.join(__dirname, "/images/" + filename)
    );
    var type = mime[path.extname(filename).slice(1)] || "text/plain";
    fstream.on("open", () => {
      res.set("content-type", type);
      fstream.pipe(res);
    });
    fstream.on("error", function() {
      res.set("Content-Type", "text/plain");
      res.status(404).end("Not found");
    });
  }
});

app.get("/python/connect/:node_name", (req, res) => {
  console.log(req.params.node_name, " connected");
  var flag = true;
  node_list.forEach(element => {
    if (element.name == req.params.node_name) {
      element.status_g = "true";
      element.is_connected = "true";
      element.kill = "false";
      flag = false;
      res.send("ok");
    }
  });
  if (flag) {
    node_list.push({
      name: req.params.node_name,
      start_up: "true",
      kill: "false",
      update: "false",
      is_connected: "true",
      status_g: "true"
    });
    res.send("ok");
  }
});

app.get("/python/disconnect/:node_name", (req, res) => {
  console.log(req.params.node_name, " disconnected");
  for (var i = 0; i < node_list.length; i++) {
    if (node_list[i].name == req.params.node_name) {
      node_list[i].status_g = "false";
      node_list[i].is_connected = "false";
    }
  }
  res.send("ok");
});

app.get("/python/start_up_status/:node_name", (req, res) => {
  for (var i = 0; i < node_list.length; i++) {
    if (node_list[i].name == req.params.node_name) {
      node_list[i].is_connected = "true";
      res.send(node_list[i].start_up);
    }
  }
});

app.get("/python/update_status/:node_name", (req, res) => {
  for (var i = 0; i < node_list.length; i++) {
    if (node_list[i].name == req.params.node_name) {
      node_list[i].is_connected = "true";
      node_list[i].status_g = "true";
      res.send(node_list[i].update);
    }
  }
});

app.get("/python/kill_status/:node_name", (req, res) => {
  for (var i = 0; i < node_list.length; i++) {
    if (node_list[i].name == req.params.node_name) {
      node_list[i].is_connected = "true";
      res.send(node_list[i].kill);
    }
  }
});

app.get("/set_status/:node_name/:info/:status/:key", (req, res) => {
  if (req.params.key == process.env["GLOBAL_KEY"]) {
    for (var i = 0; i < node_list.length; i++) {
      if (node_list[i].name == req.params.node_name) {
        if (node_list[i][req.params.info] != undefined) {
          node_list[i][req.params.info] = req.params.status;
          res.send("ok");
        } else {
          break;
        }
      }
    }
  }
  res.end();
});

app.get("/info/:key", (req, res) => {
  if (req.params.key == process.env["GLOBAL_KEY"]) {
    res.contentType("application/json");
    res.json(node_list);
  }
});

setInterval(check_nodes, 15000);

function check_nodes() {
  node_list.forEach(element => {
    if (element.is_connected != "true") {
      //disconnect
      element.status_g = "false";
    } else {
      element.is_connected = "false";
    }
  });
}

function dump_nodes() {
  fs.writeFileSync("nodes.json", JSON.stringify(node_list));
}

function read_nodes() {
  node_list = JSON.parse(fs.readFileSync("nodes.json"));
}
