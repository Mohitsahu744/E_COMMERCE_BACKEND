const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const jwtkey = 'e-commerce'
require('./db/config')
const User = require('./db/User')
const Product = require('./db/Product')
const app = express()
const PORT = process.env.PORT || 4000
app.use(express.json())
app.use(cors());
app.post('/register', async (req, resp) => {
    let user = new User(req.body);
    let result = await user.save()
    result = result.toObject();
    
    delete result.password;
    jwt.sign({ result }, jwtkey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            resp.send({ result: "somthing went wrong, Please after some time" })
        }
        resp.send({ result, auth: token })
    })

})
app.post('/login', async (req, resp) => {
    if (req.body.email && req.body.password) {
        let user = await User.findOne(req.body).select('-password');
        if (user) {
            jwt.sign({ user }, jwtkey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    resp.send({ result: "somthing went wrong, Please after some time" })
                }
                resp.send({ user, auth: token })
            })

        } else {
            resp.send({ result: 'No user found' })
        }
    }
    else {
        resp.send({ result: 'No user found' })
    }
})

app.post("/add-product", async (req, resp) => {
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result)
})

app.get("/products", async (req, resp) => {
    let products = await Product.find();
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: "Products not found" })
    }
})

app.delete('/products/:id', async (req, resp) => {
    const result = await Product.deleteOne({ _id: req.params.id });
    resp.send(result);
})

app.get('/product/:id', async (req, resp) => {
    let result = await Product.findOne({ _id: req.params.id });
    if (result) {
        resp.send(result);
    } else {
        resp.send({ result: "No Record Found." })
    }
})

app.put('/product/:id', async (req, resp) => {
    let result = await Product.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    resp.send(result)
})

app.get('/search/:key', async (req, resp) => {
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { price: { $regex: req.params.key } },
            { category: { $regex: req.params.key } },
            { company: { $regex: req.params.key } }
        ]
    })
    resp.send(result)
})
// function varifyToken(req,resp,next){
    
// }


app.listen(`${PORT}`)