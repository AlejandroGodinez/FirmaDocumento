const router = require('express').Router()
const fs = require('fs') 
const path = require('path')

let userJSON = require('../user.json')

router.route('/EditUser')
    .post((req,res) =>{
        let i = userJSON.findIndex(e => e.LoggedUser == true)
        let{correo, password} = req.body;
        
        if(correo == "") correo = userJSON[i].correo
        if(password == "") password = userJSON[i].password
        else{
            //hace los cambios del usuario
            userJSON[i].correo = correo
            userJSON[i].password = password
        }
        
        //guarda cambios
        const bdPath = path.join(__dirname, '../user.json')
        fs.writeFileSync(bdPath, JSON.stringify(userJSON))

        //renderiza home de nuevo
        res.render('home')
        
    })

module.exports = router;