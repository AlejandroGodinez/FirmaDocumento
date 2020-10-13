const router = require('express').Router()
const dialog = require('dialog')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const fs = require('fs') 
const path = require('path')
const argon2 = require('argon2')

let userJSON = require('../user.json')

async function cryptPwd(password){
    const hash = await argon2.hash(password);
    return hash;
}

router.route('/RegistroUsuario')
    .post(async (req,res)=>{

        let date = new Date();

        //ingresar fecha de ingreso al usuario
        let loginDate = date.getFullYear()+"/"+date.getMonth()+"/"+date.getDay()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
        let {email, psw} = req.body;
        let newpsw = await cryptPwd(psw)
        let objUser = {
            correo: email,
            password: newpsw,
            LoginTime: loginDate, 
            LoggedUser:true, 
            AuthProcess:false, 
            timesLogged:1
        }

        userJSON.push(objUser);
        const bdPath = path.join(__dirname, '../user.json')
        fs.writeFileSync(bdPath, JSON.stringify(userJSON))

        // res.render('QRauth', {
        //     title: "QR Google Authenticator",
        //     condition: false,
        //     QR_src : data
        // });

        res.render('home', {
            condition: false,
            Usuario: objUser.correo,
            LoginCount:objUser.timesLogged,
            lastLogin:objUser.LoginTime
        })

    })

    module.exports = router;