/** Database setup for BizTime. */

const { Client } = require('pg')

// declare db uri
let DB_URI;

if (process.env.NODE_ENV === 'test') {
    DB_URI = "postgresql:///biztime_test"
}
else {
    DB_URI = "postgresql:///biztime"
}

// connect to db
// let db = new Client({
//     connectionString: DB_URI
// })
let db = new Client({
    connectionString: DB_URI
})

db.connect()

module.exports = db