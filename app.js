const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const exec = require("child_process").exec;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/images");
    },
    filename: function (req, file, cb) {
        cb(null, "pixelate.jpg");
    }
});
const upload = multer({
    storage: storage
});

const app = express();
const port = process.env.PORT || 3000;

app.set("views", "./views");
app.set("view engine", "pug");
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use("/", express.static(__dirname + "/public"));

app.get("/", function (req, res) {
        res.render("index");
    })
    .post("/upload", upload.single("image"), function (req, res) {
        res.redirect("/");
    })
    .post("/send", function (req, res) {
        const size = req.body.size;
        const toExec = "java -jar ./public/pixelate.jar " + size;
        const child = exec(toExec,
            function (error, stdout, stderr) {
                if (error !== null) {
                    console.log("Error -> " + error);
                }
                res.download(path.join(__dirname, "/public/images/" + size + "x" + size + ".jpg"));
            });
    });

app.listen(port);
