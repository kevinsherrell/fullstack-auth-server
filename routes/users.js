const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const {db} = require('../mongo');
const {uuid} = require('uuidv4');
const {validateUser} = require('../validation/user');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* POST create user*/
router.post('/create', async (req, res) => {
    console.log("create has been called");
    let hashed;
    const userObj = {
        email: req.body.email,
        password: req.body.password,
        verify: req.body.verify
    }
    // validate that user object is correct
    console.log("user object", userObj);
    const validated = validateUser(userObj);
    //
    try {
        const userFound = await db().collection('users').findOne({email: userObj.email});
        if (userFound !== null) {
            return res.json({
                success: false,
                message: 'this email exists'
            })
        }

        if (validated.isValid) {
            hashed = await bcrypt.hash(userObj.password, saltRounds);
            userObj.password = hashed;
        } else {
            throw new Error("error");
        }


        db().collection('users').insertOne(
            {
                _id: uuid(),
                email: userObj.email,
                password: userObj.password
            }
        ).then(result => {
            res.json({
                success: true,
                result: result
            })
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            isValid: validated.isValid,
            errors: validated.errors
        })
    }


})

/* POST login user*/
router.post('/login', async (req, res) => {
    console.log("loggin running");
    const foundUser = await db().collection('users').findOne({email: req.body.email});
    bcrypt.compare(req.body.password, foundUser.password)
        .then(result => {
            if (result === true) {
                res.json({
                    success: true
                })
            } else {
                res.json({
                    success: false
                })
            }
        })
        .catch(err => {
            res.send({
                success: false,
                message: err
            })
        })
})

module.exports = router;
