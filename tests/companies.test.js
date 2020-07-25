const request = require('supertest')
const app = require('../app')
// set the environemt variable before requiring db
process.env.NODE_ENV === 'test'
const db = require('../db')

/**
 * What I want to test:
 * getting all companies
 * /companies
 * getting company by code
 * /companies/code
 * posting a company
 * /companies/create-company
 * editing a company by code
 * /companies/code
 * deliting a company by code
 * /companies/code
 */


//  Test
/**
 * before each test, create a company
 * delete the company after each test
 * close the db connection after all the tests has run
 */
let testCompany
let testInvoice
beforeEach(async () => {
    const comp= await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('MOE_SP', 'Moayed sport equipments', 'making amazing things for all sports')

    RETURNING *`)

    const invoice= await db.query(`
    INSERT INTO invoices  (comp_Code, amt, paid, paid_date)
    VALUES('MOE_SP', 300, true, '2018-01-01')

    RETURNING *`)
    testCompany = comp.rows[0]
    testInvoice = invoice.rows[0]
})
//==================================================================================================================

afterEach(async () => {
    await db.query('DELETE FROM companies')
})
//==================================================================================================================

afterAll(async () => {
    await db.end()
})

//==================================================================================================================

describe('GET/companies', () => {
    test('test reading companies', async () => {

        const res = await request(app).get('/companies')
        expect(res.statusCode).toEqual(200)

        expect(res.body).toEqual({companies:[testCompany]})

    })
})
//==================================================================================================================

describe('GET/companies/code', () => {
    test('test reading a company', async () => {

        const res = await request(app).get(`/companies/${testCompany.code}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body.results).toEqual(testCompany)


    })
})
//==================================================================================================================

describe('POST/companies/create-company', () => {
    test('test posting a company', async () => {

        const res = await request(app).post(`/companies/create-company`).send({code:'MIC', name:'Moe Ice Cream', description:'Best Ice cream ever'})
        expect(res.statusCode).toEqual(201)
        expect(res.body).toEqual({code:'MIC', name:'Moe Ice Cream', description:'Best Ice cream ever'})


    })
})
//==================================================================================================================

describe('PUT/companies/code', () => {
    test('test posting a company', async () => {

        const res = await request(app).put(`/companies/${testCompany.code}`).send({name:'Moe Ice Cream', description:'Best Ice cream ever'})
        expect(res.statusCode).toEqual(200)
        console.log(res.body)
        expect(res.body).toEqual({code:testCompany.code, name:'Moe Ice Cream', description:'Best Ice cream ever'})


    })
})
//==================================================================================================================
describe('DELETE/companies/code', () => {
    test('test posting a company', async () => {

        const res = await request(app).delete(`/companies/${testCompany.code}`)
        expect(res.statusCode).toEqual(200)
        console.log(res.body)
        expect(res.body).toEqual({status: "Deleted"})


    })
})