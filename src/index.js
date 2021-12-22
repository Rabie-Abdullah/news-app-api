const express = require('express')
const reporterRouter = require('./routers/reporter')
const newsRouter = require('./routers/news')
require('./db/mongoose')



const app = express()
app.use(express.json())

const port = process.env.PORT || 3000

app.use(reporterRouter)
app.use(newsRouter)





app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})


const {phone} = require('phone');

