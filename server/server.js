const https = require('https')
const fs = require('fs')
const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')
const bodyparser = require('body-parser')

const uploadRouter = require('../routes/uploads')
const loginRouter = require('../routes/login')
const qrAuthRouter = require('../routes/QRauth')
const usrEditRouter = require('../routes/UserEdit')
const usrRegisterRouter = require('../routes/register')

let scripts = [{script: '../views/login.js' }]

let app = express()
let port = 3000;

app.use(bodyparser.urlencoded({extended: true}))
app.use(bodyparser.json())

app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname, '../views/layouts/')
}));
app.set('view engine', 'hbs');

app.use(uploadRouter);
app.use(loginRouter);
app.use(qrAuthRouter);
app.use(usrEditRouter);
app.use(usrRegisterRouter)

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

app.use(express.static(path.join(__dirname, '../public')))

app.route('/')
.get((req,res) =>{
    res.render('login', {
        title: 'Handlebars login',
        condition: false
    })
})


    const https_key_cert ={
        // key: fs.readFileSync("C:/Users/Alejandro/example.com+5-key.pem"),
        key: fs.readFileSync("localhost-key.pem"),
        cert: fs.readFileSync("localhost.pem")
        // cert: fs.readFileSync("C:/Users/Alejandro/example.com+5.pem")
    };
    
    
    https.createServer(https_key_cert, app).listen(port,()=> {
        console.log("Open in port " + port);
    })
