const router = require('express').Router()
let dialog = require('dialog')
let userJSON = require('../user.json')

router.route('/ValidarUsuario')
    .post((req,res) => {
        let {email, psw} = req.body;
        
        if(userJSON.find(e => e.correo == email && e.password == psw)){
            res.render('home');
        }else{
            dialog.err("Credenciales invalidas");
            res.render('login');
        }
    })

module.exports = router;

