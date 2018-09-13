const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const exec = require("child_process").exec;
const session = require("express-session");
const validator = require("express-validator");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/images");
    },
    filename: function (req, file, cb) {
        const imgPath = req.session.id + "_preview.jpg";
        cb(null, imgPath);
    }
});
const upload = multer({
    storage: storage
});

const app = express();
const port = process.env.PORT || 3000;

app.set("views", "./views")
    .set("view engine", "pug")
    .use(express.static(path.join(__dirname, "/public")))
    .use(bodyParser.urlencoded({
        extended: false
    }))
    .use(session({
        secret: "secret-key",
        resave: true,
        saveUninitialized: true
    }))
    .use(validator());


app.get("/", function (req, res) {
        console.log(req.session.errors);
        res.render("index", {
            session_id: req.session.id,
            errors: req.session.errors
        });
        req.session.errors = null;
        console.log("cleared");
        console.log(req.session.errors);
    })
    .post("/upload", upload.single("image"), function (req, res) {
        req.session.errors = null;
        res.redirect("/");
    })
    .post("/download", function (req, res) {
        const size = req.body.size;
        req.checkBody("size", "Input a number").isInt();
        const errors = req.validationErrors();
        req.session.errors = errors;
        if (errors) {
            res.redirect("/");
        } else {
            const toExec = "java -jar ./public/pixelate.jar " + size + " " + req.session.id;
            const child = exec(toExec,
                function (error, stdout, stderr) {
                    if (error !== null) {
                        const fakeError = "error";
                        req.checkBody("fakeError", "Upload an image").isInt();
                        req.session.errors = req.validationErrors();
                        res.redirect("/");
                        console.log("Error -> " + error);
                    } else {
                        res.download(path.join(__dirname, "/public/images/" + req.session.id + "_" + size + "x" + size + ".jpg"));
                        res.redirect("/");
                    }
                });
        }
        
    });

app.listen(port);
