const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const globby = require('globby')
const fs = require('fs')
const axios = require('axios')
const crypto = require('crypto');
const dialog = require('dialog')
const crypt_decrypt = require('../fileEncyptionDecryption/encriptado')

let uploadFileName = '';

const storage = multer.diskStorage({
     destination: path.join(__dirname, '../public/img'),
      filename: (req, file, cb) => { 
          cb(null,file.originalname);
         } 
        })
const fileFilter = (req, file, cb)=>{ 
    uploadFileName = file.originalname;
    if (file.mimetype === 'text/plain') {
            cb(null, true);
            } else{
                cb(null, false); 
            }
    }

const uploadFile = multer({ 
    storage,
     limits: {fileSize: 1000000},
      fileFilter 
    })

    
router.get('/upload', async (req,res)=>{
    const paths = await globby(['**/public/img/*']);
    const pathsNew = paths.map(function(x){
        return x.replace("public/",'')
    })
    res.send(pathsNew)
})

router.post('/upload', uploadFile.single('file'), async (req, res) => {
    res.redirect(303, '/archivoCertificado');
   });

//Regresa el archivo como una descarga en el navegador
router.get('/archivoCertificado',(req,res)=>{
    
    let rutaArchivo = '../public/img/'+uploadFileName
    const filePath = path.join(__dirname, rutaArchivo);

    //se firma el documento con la llave privada y  publica
    const private_key = fs.readFileSync('./key/privateKey.pem', 'utf-8');

    //firma del documento
    const doc = fs.readFileSync(filePath);

    const signer = crypto.createSign('RSA-SHA256');
    signer.write(doc);
    signer.end();

    // Returna la firma en formato 'binary', 'hex' o 'base64'
    const signature = signer.sign(private_key, 'base64')

    fs.writeFileSync('./Signature/signature.txt', signature);

    //despues de firmarlo lo debe verificar
    const public_key = fs.readFileSync('./key/publicKey.pem', 'utf-8');
    const signatureFirm = fs.readFileSync('./Signature/signature.txt', 'utf-8');

    // File to be signed
    const doc2 = fs.readFileSync(filePath);

    // Signing
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.write(doc2);
    verifier.end();

    // Verify file signature ( support formats 'binary', 'hex' or 'base64')
    const result = verifier.verify(public_key, signatureFirm, 'base64'); 
    
    if(result){
        console.log('Digital Signature Verification True')
    }else{
        dialog.err('Digital Signature Verification False')
    }

    try{
        if(fs.statSync(filePath).isFile()){
            res.download(filePath)

        }
    }catch(e){
        console.log("Archivo no existente")
    }
})

router.post('/archivosSubidos',(req,res)=>{

        let archivosArreglo;
        axios('https://localhost:3000/upload') // hace una peticion get a upload para obtener el nombre de todos los archivos guardados
            .then(response => {
                
                //Mapear el response.data a un arreglo de objetos para imprimirlo en el html
                archivosArreglo = response.data.map(archivo => {return {nombre: archivo}})            
    
               // enviar el arreglo al html
                res.render('home',{
                    title: "Home",
                    condition:false,
                    pathsNew : archivosArreglo
                })
    
            })
    });
    
    let cryptFile = function(file){
        let rutaArchivo = '../public/img/'+file
        let filePath = path.join(__dirname, rutaArchivo);
        let text =  fs.readFileSync(filePath, 'utf8')
        let textToEncrypt = crypt_decrypt.encrypt(text)
        //ahora se escribe el texto cifrado en el archivo
        rutaArchivo = '../fileEncyptionDecryption/encryptedFile.txt'
        filePath = path.join(__dirname, rutaArchivo);
        fs.writeFileSync(filePath, textToEncrypt)
    }
    
    let decryptFile = function(){
        let rutaArchivo = '../fileEncyptionDecryption/encryptedFile.txt'
        let filePath = path.join(__dirname, rutaArchivo);
        let text = fs.readFileSync(filePath, 'utf8')
        let cryptedText = crypt_decrypt.decrypt(text)
        rutaArchivo = '../fileEncyptionDecryption/decryptedFile.txt'
        filePath = path.join(__dirname, rutaArchivo);
        fs.writeFileSync(filePath, cryptedText)
    }
    
    router.route('/Crypt')
        .post((req,res)=>{
            res.redirect(303, '/archivoEncriptado');
        })

    router.get('/archivoEncriptado', (req,res)=>{
        cryptFile(uploadFileName)
        res.send(200);
    })
    
    router.route('/Decrypt')
        .post((req,res)=>{
            res.redirect(303, '/archivoDesencriptado')
        })
    
    router.get('/archivoDesencriptado', (req,res)=>{
        decryptFile();
        res.send(200);
    })

module.exports = router;