const mongoose = require('mongoose')

const User = mongoose.model('User', {
  name:String,
  email:String,
  password:String,
  registerDate:{
    type: Date,
    default: Date.now()
  }
})

module.exports = User