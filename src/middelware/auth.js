const jwt = require('jsonwebtoken')
const Reporter = require('../models/reporter')



const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'mysecretkey')
        const reporter = await Reporter.findOne({ _id: decoded._id, 'tokens.token': token })


        if(!reporter) {
            throw new Error()
        }

        req.token = token
        req.reporter = reporter
        
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please Authenticate!' })

    }
}

module.exports = auth