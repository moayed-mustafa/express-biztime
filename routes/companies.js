/** ROUTES FOR COMPANIES DATABASE OPERATIONS */



const express = require('express')
const router = express.Router()
const ExpressError = require('../expressError')
// require db
const db = require("../db")
// const app = require('../app')


/** MAKE ROUTES HERE */
    // get all companies
router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`)
        if (results.rows.length == 0) {
            throw new ExpressError("This table has no rows", 404)
        }
        return res.send({ companies: results.rows })
    }catch (e) {
        next(e)
    }
})

// get one company with code
router.get("/:code", async (req, res, next) => {
    try {
        let {code} = req.params
        const result = await db.query(`SELECT * FROM companies
                                        WHERE code =$1`, [code])
        if (result.rows.length === 0) {
            throw new ExpressError(`${code} not found`, 404)
        }
        console.log(result.rows[0].code)
        const invoices = await db.query(`
            SELECT * FROM invoices
            WHERE comp_code ='${result.rows[0].code}'
        `)
        return res.send({ results: result.rows[0], invoices: invoices.rows[0] })

    }catch (e) {
        return next(e)
    }
})

// create a company
router.post("/create-company", async (req, res, next) => {
    // {code, name, description}
    try {
        const { code, name, description } = req.body
        if (!(code || name || description)) {
            throw new ExpressError('Data is missing', 404);
        }
        const results = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES($1,$2,$3)
        RETURNING *
        `,[code, name, description])

        return res.send(results.rows[0])

    } catch (e) {
        return next(e)
    }
})
// edit company
router.put("/:code", async (req, res, next) => {
    try {
        const { code } = req.params
        const { name, description } = req.body
        if (name == undefined || description == undefined) {
            throw new ExpressError('data is not complete', 404)

        }
        const results = await db.query(`
        UPDATE companies
        SET name =$1,
        description =$2
        WHERE code = $3
        RETURNING *
        `, [name, description, code])
        if (results.rows.length == 0) {
            throw new ExpressError('Company not available', 404)
        }
        return res.send(results.rows)

    } catch (e) {
        return next(e)
    }
    // delete company
})

router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params
        const result = await db.query(`
        DELETE FROM companies
        WHERE code =$1
        `, [code])
        if (result.rowCount == 0) {
            throw new ExpressError(`company with code :${code} does not exist`, 404)
        }
        return res.send({status: 'Deleted'})

    } catch (e) {
        return next(e)
    }


})
// EXPORT ROUTES
module.exports = router

