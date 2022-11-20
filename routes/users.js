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
    const validated =  validateUser(userObj);
    //
    try {

        console.log(validated);
        console.log(req.body);
        if (validated.isValid) {
            hashed = bcrypt.hash(userObj.password, saltRounds);
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
            res.send({
                success: true,
                result: result
            })
        })
    } catch (error) {
        console.log(error);
        res.send({
            success: false,
            isValid: validated.isValid,
            errors: validated.errors
        })
    }


})

module.exports = router;
