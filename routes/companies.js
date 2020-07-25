/** ROUTES FOR COMPANIES DATABASE OPERATIONS */



const express = require('express')
const router = express.Router()
const ExpressError = require('../expressError')
// require db
const db = require("../db")


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
        const result = await db.query(`SELECT c.code, c.name, c.description, i.industry_field
                                        FROM companies AS c
                                        LEFT JOIN company_industry as ci
                                        ON c.code = ci.comp_code
                                        LEFT JOIN industries AS i
                                        on i.code = ci.industry_code
                                        WHERE c.code =$1`, [req.params.code])
        if (result.rows.length === 0) {
            throw new ExpressError(`${req.params.code} not found`, 404)
        }
        const invoices = await db.query(`
            SELECT * FROM invoices
            WHERE comp_code ='${result.rows[0].code}'
        `)
        // structure the result:
        const { code, name, description } = result.rows[0]
        let industries = result.rows.map(r => r.industry_field)
        return res.send({ code,name,description,industries, invoices: invoices.rows[0] })

    }catch (e) {
        return next(e)
    }
})

// create a company
router.post("/create-company", async (req, res, next) => {
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

        return res.status(201).send(results.rows[0])

    } catch (e) {
        return next(e)
    }
})
// add a industry to a company's industry
router.post("/:code", async (req, res, next) => {
    try {
        // erro handling:
        const { comp_code, industry_code } = req.body
        if (comp_code == undefined || industry_code == undefined) {
            throw new ExpressError('Missing some data...', 404)
        }
        let get_code = await db.query(`SELECT code FROM companies`)

        let comp_codes = get_code.rows.map(r => r.code)
        if ( ! comp_codes.includes(comp_code)) {
            throw new ExpressError(`${comp_code} does not exist`, 404)
        }

        let get_industry = await db.query(`SELECT code FROM industries`)

        let industries_codes = get_industry.rows.map(r => r.code)
        if ( ! industries_codes.includes(industry_code)) {
            throw new ExpressError(`${industry_code} does not exist`, 404)
        }

        const result = await db.query(`INSERT INTO company_industry (comp_code, industry_code)
                                        VALUES ($1,$2)
                                        RETURNING *`, [comp_code, industry_code])



        return res.send({ message: result.rows })

    }catch (e) {
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
        return res.send(results.rows[0])

    } catch (e) {
        return next(e)
    }
})
// delete company

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

