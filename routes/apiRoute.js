const express = require('express');
const router = express.Router()


router.get('/registration', (req, res)=>{
    res.send({message: 'registration route'})
})


module.exports = router