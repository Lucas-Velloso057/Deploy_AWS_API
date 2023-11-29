require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

//config

app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

//models

const User = require("./models/User")


//public route test
app.get('/', (req, res)=>{
  res.status(200).json({message:"Bem vindo novo teste, atualizado!"})
})

//private route
app.get("/user/:id", checkToken ,async (req, res)=>{

  const id = req.params.id

  //check existing User
  const user = await User.findById(id, '-password')

  if(!user){return res.status(404).json({msg:"Usuario não encontrado!"})}

  res.status(201).json({ user })

})

//Register User
app.post('/auth/register/', async (req, res)=>{
  const {name, email, password, confirmPassword} = req.body

  if(!name){return res.status(422).json({errorMessage:"O campo Nome é obrigatório"})}
  if(!email){return res.status(422).json({errorMessage:"O campo email é obrigatório"})}
  if(!password){return res.status(422).json({errorMessage:"O campo Senha é obrigatório"})}
  if(password !== confirmPassword){return res.status(422).json({errorMessage:"As senhas não conferem"})}

  emailLow = email.toLowerCase();

  //Verify existing User
  const userExists = await User.findOne({email : email})

  if(userExists){return res.status(422).json({errorMessage:"Usuario ja Cadastrado!"})}

  //Password processing
  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  //Create user
  const user = new User({
    name,
    email:emailLow,
    password:passwordHash
  })

  try {

    await user.save()
    res.status(201).json({msg:"Usuario criado com sucesso!"})

  } catch (error) {
    console.log(error)
    return res.status(500).json({errorMsg:"Houve um erro no servidor!"})
  }

})

//Authenticate User
app.post('/auth/user/', async (req, res)=>{
  const {email, password} = req.body

  if(!email){return res.status(422).json({errorMessage:"O campo email é obrigatório"})}
  if(!password){return res.status(422).json({errorMessage:"O campo Senha é obrigatório"})}

  var emailLow = email.toLowerCase();

  //Verify existing User
  const user = await User.findOne({email : emailLow})

  if(!user){return res.status(404).json({errorMessage:"Usuario não encontrado!"})}

  //verify matching password

  const checkPassword = await bcrypt.compare(password, user.password)

  if(!checkPassword){
    return res.status(422).json({errorMessage : "Senha Invalida!"})}

  try {

    const secret = process.env.SECRET
    const token = jwt.sign({ id:user._id}, secret, {expiresIn: '1h'})

    res.status(200).json({msg:"Autenticação realizada com sucesso!", token})

    
  } catch (error) {
    console.log(error)
    return res.status(500).json({errorMsg:"Houve um erro no servidor!"})
  }


})

//checkToken
function checkToken(req, res, next){

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(" ")[1] //token vem no formato "Bearer hU*HfaB&%"

  if(!token){
    return res.status(401).json({msg:"Acesso Negado!!"}) //indica que suas informações de autenticação para a página estão incorretas
  }

  try {
    
    const secret = process.env.SECRET
    jwt.verify(token, secret)
    userId = decoded.userId;

    next()

  } catch (error) {
    console.log(error)
    return res.status(400).json({errorMessage:"Token Inválido!"}) //o servidor não pode ou não irá processar a requisição devido a alguma coisa que foi entendida como um erro
  }

}


//Credentials
const DB_user = process.env.DB_USER;
const DB_password = process.env.DB_PASS;

mongoose.connect(
  `mongodb+srv://${DB_user}:${DB_password}@authapidb.kdalaum.mongodb.net/?retryWrites=true&w=majority`
  )
.then(()=>{
  app.listen(3000)
  console.log("Conectou ao DB com sucesso!")
})
.catch((err)=>{console.log(err);})
