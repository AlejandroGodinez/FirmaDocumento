const router = require('express').Router()
const dialog = require('dialog')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const fs = require('fs') 
const path = require('path')

let AuthSecret = require('../secret/secret.json')
let userJSON = require('../user.json')

router.route('/salida')
    .post((req,res) =>{
        let i = userJSON.findIndex(e => e.LoggedUser == true)
        userJSON[i].LoggedUser = false

         //actualiza datos del usuario
         const bdPath = path.join(__dirname, '../user.json')
         fs.writeFileSync(bdPath, JSON.stringify(userJSON))
         res.render('login')
    })

router.route('/ValidarUsuario')
    .post((req,res) => {
        let {email, psw} = req.body;

        if(userJSON.find(e => e.correo == email && e.password == psw)){
            //bandera de autenticacion se levanta
            let i = userJSON.findIndex(e => e.correo == email && e.password == psw)
            userJSON[i].AuthProcess = true

            const bdPath = path.join(__dirname, '../user.json')
            fs.writeFileSync(bdPath, JSON.stringify(userJSON))
            
            //se hace la autenticacion multifactor
            let randStrGenerator = function(length, randomStr=""){
                randomStr += Math.random().toString(32).substr(2,length)
                if(randomStr.length > length) return randomStr.slice(0,length)
                return randStrGenerator(length, randomStr)
            }
            
            
            let secret = speakeasy.generateSecret({
                name: randStrGenerator(32)
            });

            //se guarda el secreto en un json para verificarlo despues
            AuthSecret.code = secret.ascii;
            const secretPath = path.join(__dirname, '../secret/secret.json')
            fs.writeFileSync(secretPath, JSON.stringify(AuthSecret))

            qrcode.toDataURL(secret.otpauth_url, function(err, data){
                if(err){
                    dialog.err(err);
                    res.render('login')
                } 
                else{
                    
                    res.render('QRauth', {
                        title: "QR Google Authenticator",
                        condition: false,
                        QR_src : data
                    });
                }
            })
        }else{
            dialog.err("Credenciales invalidas");
            res.render('login');
        }
    })

module.exports = router;

