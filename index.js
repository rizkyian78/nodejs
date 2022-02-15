const express = require("express")
const { DataTypes } = require("sequelize")
const app = express()
const sequelize = require("./models/index").sequelize
const User = require("./models/user")
const {hash, compare} = require("bcrypt")
const jwt = require("jsonwebtoken")

const saltRounds = 10


app.use(express.urlencoded({extended: true}))
app.use(express.json())


const authentticate = (req, res, next) => {
    const token = req.headers.authorization
    const payload = jwt.decode(token, "rahasia")
    if(token) {
        return res.status(200).json({message: "tidak punya akses"})
    }
    next()
}


app.post("/register", async (req, res) => {
    const hashedPassword =  await hash(req.body.password, saltRounds)


    const data = await User(sequelize, DataTypes).create({
        username: req.body.username,
        password: hashedPassword
    })

    res.status(200).json(data)
})

app.post("/login", async (req, res) => {

    const user = await User(sequelize, DataTypes).findOne({
        where: {
            username: req.body.username
        }
    })

    const isEligible = await compare(req.body.password, user.password)

    if(!isEligible) {
       return res.status(400).json({message: "password atau username salah"})
    }


    const token = jwt.sign(req.body, "rahasia")

    res.status(200).json({
        username: req.body.username,
        token
    })
})

app.delete("/delete_user/:id", authentticate, async (req, res) => {

     await User(sequelize, DataTypes).destroy({
        where: {
            id: req.params.id
        }
    })

    res.status(200).json({message: "user berhasil dihapus"})
})




app.listen(2000, console.log("listening at " + 2000))