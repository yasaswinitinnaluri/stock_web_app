const express = require('express');
const request = require('request');
const app = express();
app.use(express.json());
const bodyParser = require("body-parser")
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const path = require('path')
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
var serviceAccount = require("./key.json");
initializeApp({
    credential: cert(serviceAccount)
});
const db = getFirestore();

app.get('/profile', function(req, res) {

    res.render("profile", { name: userdata.fullname, username: userdata.username, email: userdata.email });
});
app.get('/stockData', function(req, res) {
    res.render("stockData", { msg: "", n: "", p: "", c: "", h: "", l: "" });
});

app.get('/', function(req, res) {
    res.render("login", { msg: "", msg1: "" });
});
app.get('/login', function(req, res) {
    res.render("login", { msg: "", msg1: "" });
});
app.get('/signup', function(req, res) {
    res.render("signup");
});
app.get('/home', function(req, res) {
    res.render("home", { name: userdata.username });
});

app.post('/onsignup', urlencodedParser, function(req, res) {
    let data = req.body;
    delete data.confirmpassword;
    const id = data.email.toString();
    db.collection('user_details').doc(id).set(data);
    res.render("login", { msg: "", msg1: "" });


});
app.post('/onlogin', urlencodedParser, async function(req, res) {
    const ref = await db.collection('user_details').doc(req.body.email).get();
    if (!ref.exists) {
        res.render("login", { msg: "invalid email-id or password", msg1: "" });
    } else {
        userdata = ref.data();
        if (userdata.password == req.body.password) {
            x = req.query.email;
            res.render("home", { name: userdata.username });
        } else {
            res.render("login", { msg: "enter crt password", msg1: "" });
        }
    }
});
app.get("/data", function(req, res) {
    request(('https://financialmodelingprep.com/api/v3/quote/' + req.query.symbol.toUpperCase() + '?apikey=a42440bb66a9a8514262f262089baf5c'),
        function(err, respond, data) {
            let x = JSON.parse(data);
            if (x.length != 0) {
                const name = "company name : " + (x[0].name).toString();
                const price = "current price : " + (x[0].price).toString();
                const change = "change : " + (x[0].change).toString() + "%";
                const high = "high : " + (x[0].dayHigh).toString();
                const low = "low : " + (x[0].dayLow).toString();
                res.render("stockData", { msg: "", n: name, p: price, c: change, h: high, l: low });
            } else {
                res.render("stockData", { msg: "plz , enter crt symbol like AAPL,AMZN etc..", n: "", p: "", c: "", h: "", l: "" });
            }
        });
});
app.get('/logout', function(req, res) {
    userdata = {};
    res.render("login", { msg1: "you have successfully logout !! ", msg: "" });
});
app.listen(3000);