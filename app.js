const nodemailer = require("nodemailer");
const multer = require("multer");
const bodyParser = require("body-parser");

const fs = require("fs");

const express = require("express");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var to;
var subject;
var body;
var path;

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./images");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: Storage,
}).single("image");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("/index.html");
});

app.post("/sendmail", (req, res) => {
  //execute the middleware

  upload(req, res, function (err) {
    if (err) {
      console.log(err);
      return res.end("Something went wrong");
    } else {
      to = req.body.to;
      subject = req.body.subject;
      body = req.body.body;

      path = req.file.path;

      console.log(to);
      console.log(subject);
      console.log(body);
      console.log(path);

      var transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        auth: {
          user: "",
          pass: "",
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      var mailOptions = {
        from: "",
        to: to,
        subject: subject,
        text: body,
        attachements: [
          {
            path: path,
          },
        ],
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log(err);
        } else {
          console.log("Email Sent" + info.response);
          fs.unlink(path, function (err) {
            if (err) {
              return res.end(err);
            } else {
              console.log("deleted");
              return res.redirect("/result.html");
            }
          });
        }
      });
    }
  });
});

app.listen(5000, () => {
  console.log("App started on port 5000");
});
