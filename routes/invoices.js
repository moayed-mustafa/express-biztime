/** ROUTES FOR INVOICES DATABASE OPERATIONS */

const express = require('express')
const router = express.Router()
const ExpressError = require('../expressError')
// require db
const db = require("../db")


/** MAKE ROUTES HERE */
router.get("/", (req, res, next) => {
    console.log("hit")
    const response = {message: " arrived at  invoices get route"}
    return res.send(response)
})




// EXPORT ROUTES
module.exports = router