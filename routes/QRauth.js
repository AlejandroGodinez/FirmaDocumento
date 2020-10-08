const router = require('express').Router()
const speakeasy = require('speakeasy')
const fs = require('fs') 
const path = require('path')
const dialog = require('dialog')

let secretAuth = require('../secret/secret.json')
let userJSON = require('../user.json')

router.route('/GoogleAuth')
    .post((req,res)=>{
        //se verifica el token recibido
        let {token} = req.body
        //console.log(qrtoken);
        //console.log(secretAuth.code);
        let verified = speakeasy.totp.verify({
            secret: secretAuth.code,
            encoding: 'ascii',
            token: token
        })

        console.log(verified);
        //verifica si el qrtoken es valido
        if(verified){
            let date = new Date();

            //ingresar fecha de ingreso al usuario
            let loginDate = date.getFullYear()+"/"+date.getMonth()+"/"+date.getDay()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();

            let i = userJSON.findIndex(e => e.AuthProcess == true)
            userJSON[i].AuthProcess = false;
            userJSON[i].LoggedUser = true;
            userJSON[i].timesLogged++;
            userJSON[i].LoginTime = loginDate;  
            
            //actualiza datos del usuario
            const bdPath = path.join(__dirname, '../user.json')
            fs.writeFileSync(bdPath, JSON.stringify(userJSON))


            res.render('home', {
                condition: false,
                Usuario: userJSON[i].correo,
                LoginCount:userJSON[i].timesLogged,
                lastLogin:userJSON[i].LoginTime
            })
        }else{
            let i = userJSON.findIndex(e => e.AuthProcess == true)
            userJSON[i].AuthProcess = false

            //actualiza datos del usuario
            const bdPath = path.join(__dirname, '../user.json')
            fs.writeFileSync(bdPath, JSON.stringify(userJSON))

            dialog.err("Token incorrecto autenticacion fallida")
            res.render('login')

        }
    })

module.exports = router;