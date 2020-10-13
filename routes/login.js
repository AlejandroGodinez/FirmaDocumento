const router = require('express').Router()
const dialog = require('dialog')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const fs = require('fs') 
const path = require('path')
const argon2 = require('argon2')

let AuthSecret = require('../secret/secret.json')
let userJSON = require('../user.json')
const { route } = require('./QRauth')
const { verify } = require('crypto')

// async function cryptPwd(password){
//     const hash = await argon2.hash(password);
//     return hash;
// }

async function verifyPassword(hash, password){
    try {
        if(await argon2.verify(hash, password)) return true;
        else return false;             
    }  catch (error) {
        console.log(err);
    }
}

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
    .post(async(req,res) => {
        let {email, psw} = req.body;
        console.log(req.body);
        if(userJSON.find(e => e.correo == email)){
            let i = userJSON.findIndex(e => e.correo == email)
            let auth = await verifyPassword(userJSON[i].password, psw );
            //console.log(auth); 
            if(auth){
                //bandera de autenticacion se levanta
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
                    dialog.err("Password invalido");
                    res.render('login');
                }
        }else{
            dialog.err("Correo invalido");
            res.render('login');
        }
    })

// router.route('/RegistroUsuario')
//     .post(async (req,res)=>{

//         let date = new Date();

//         //ingresar fecha de ingreso al usuario
//         let loginDate = date.getFullYear()+"/"+date.getMonth()+"/"+date.getDay()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
//         let {email, psw} = req.body;
//         let newpsw = await cryptPwd(psw)
//         let objUser = {
//             correo: email,
//             password: newpsw,
//             LoginTime: loginDate, 
//             LoggedUser:true, 
//             AuthProcess:false, 
//             timesLogged:1
//         }

//         userJSON.push(objUser);
//         const bdPath = path.join(__dirname, '../user.json')
//         fs.writeFileSync(bdPath, JSON.stringify(userJSON))

//         // res.render('QRauth', {
//         //     title: "QR Google Authenticator",
//         //     condition: false,
//         //     QR_src : data
//         // });

//         res.render('home', {
//             condition: false,
//             Usuario: objUser.correo,
//             LoginCount:objUser.timesLogged,
//             lastLogin:objUser.LoginTime
//         })

//     })

router.route('/RenderRegistro')
    .post((req,res)=>{
        res.render('Register')
    })
    
module.exports = router;

