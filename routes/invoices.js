/** ROUTES FOR INVOICES DATABASE OPERATIONS */

const express = require('express')
const router = express.Router()
const ExpressError = require('../expressError')
// require db
const db = require("../db")


/** MAKE ROUTES HERE */
router.get("/", async (req, res, next) => {
    // select all of the invoices
    try {


    const results = await db.query(`
    SELECT * FROM invoices;
    `)
    if (results.rows.length == 0) {
        throw new ExpressError("This table has no rows", 404)
    }
        return res.send({ result: results.rows })
    } catch (e) {
        next(e)
    }
})
// get invoices with id
router.get("/:id", async (req, res, next) => {
    try {
        // id,amt,paid,add_date,paid_date
        let {id} = req.params
        const result = await db.query(`SELECT * FROM invoices
                                        WHERE id =$1`, [id])
        if (result.rows.length === 0) {
            throw new ExpressError(`Id: ${id} is not available`, 404)
        }
        const company = await db.query(`
        SELECT * FROM companies
        WHERE code =$1
        `, [result.rows[0].comp_code])
        delete result.rows[0].comp_code
        return res.send({ invoice: result.rows[0] , company: company.rows[0]})

    }catch (e) {
        return next(e)
    }
})

// post an invoice
router.post('/create-invoice', async (req, res, next) => {
    // {comp_code, amt}
    // {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
    try {


        const { comp_code, amt } = req.body
    if (comp_code == undefined || amt == undefined) {
        throw new ExpressError('Data is missing', 404);
    }
        const current_date= getCurrentDate()

        const results = await db.query(`
        INSERT INTO invoices
        (comp_code, amt, paid, add_date, paid_date)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING id, comp_code, amt, paid, add_date, paid_date
        `, [comp_code, amt, false, current_date, null])

        return res.send({invoice: results.rows[0]})
    } catch (e) {
        next(e)
}

})

// update an invoice
router.put('/:id', async (req, res, next) => {
    try {


    const { id } = req.params;
    const { amt } = req.body
    if (amt == undefined) {
        throw new ExpressError('Data is missing', 404);
    }
    let results = await db.query(`
    UPDATE invoices
    SET amt = $1
    WHERE id = $2
    RETURNING *
    `, [amt, id])
    if (results.rows.length == 0) {
        throw new ExpressError(` No invoicce with id: ${id}`, 404)
    }
        return res.send({ invoice: results.rows[0] })
    } catch (e) {
        next(e)
    }

})
// delete an invoice
router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params
        const result = await db.query(`
        DELETE FROM invoices
        WHERE id =$1
        `, [id])
        if (result.rowCount == 0) {
            throw new ExpressError(`invoice with id ${id} does not exist`, 404)
        }
        return res.send({status: 'Deleted'})

    } catch (e) {
        return next(e)
    }
    // delete company


})

function getCurrentDate() {
    let time = Date.now()
        let date_obj = new Date(time)
        let date = date_obj.getDate();
        let month = date_obj.getMonth() + 1;
        let year = date_obj.getFullYear();
    return `${year}-${month}-${date}`
}
// EXPORT ROUTES
module.exports = router