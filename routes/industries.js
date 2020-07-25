const express = require('express')
const router = express.Router()
const ExpressError = require('../expressError')
// require db
const db = require("../db")

// ADD  ROUTES HERE :
// list all industries
router.get("/", async (req, res, next) => {
    try {
        let data = {}
        // get all the industries
        const results = await db.query(`
        SELECT  i.industry_field, i.code,c.code FROM industries AS i
        JOIN company_industry AS ci
        ON i.code = ci.industry_code
        JOIN companies as c
        ON c.code = ci.comp_code
        `)
        // structure the resonse
        results.rows.forEach(r => {
            data[r.industry_field] ? data[r.industry_field].push(r.code) : data[r.industry_field]=[r.code]
        })
        return res.send({result: data})
    } catch (e) {
        return next (e)
    }
})

// list all industries
router.post("/create-industry", async (req, res, next) => {
    try {
        const { code, industry_field } = req.body
        if (!(code || industry_field)) {
            throw new ExpressError('Data is missing', 404);
        }

        // get all the industries
        const results = await db.query(`
        INSERT INTO industries (code, industry_field)
        VALUES ($1, $2)
        RETURNING code, industry_field
        `, [code, industry_field])

        return res.send({result:results.rows[0] })
    } catch (e) {
        return next (e)
    }
})



module.exports = router
