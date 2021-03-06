const express = require('express')
const auth = require('../middelware/auth')
const News = require('../models/news')
const multer = require('multer')
const router = new express.Router()

router.post('/news', auth, async (req, res) => {
    const news = new News({
        ...req.body,
        owner: req.reporter._id
    })

    try {
        await news.save()
        res.status(201).send(news)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/news',auth,async(req,res)=>{
    try{
        await req.reporter.populate('news')
        res.send(req.reporter.news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})


router.get('/news/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const news = await News.findOne({ _id, owner: req.reporter._id })

        if (!news) {
            return res.status(404).send()
        }

        res.send(news)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/news/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'description']
    const ValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!ValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const news = await News.findOne({ _id: req.params.id, owner: req.reporter._id})

        if (!news) {
            return res.status(404).send()
        }

        updates.forEach((update) => news[update] = req.body[update])
        await news.save()
        res.send(news)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/news/:id', auth, async (req, res) => {
    try {
        const news = await News.findOneAndDelete({ _id: req.params.id, owner: req.reporter._id })

        if (!news) {
            res.status(404).send()
        }

        res.send(news)
    } catch (e) {
        res.status(500).send()
    }
})





const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            return cb(new Error('please upload an image'))
        }
        cb(undefined, true)
    }
})


router.post('/news/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const _id = req.params.id

        const news = await News.findById(_id)

        if(!news) {
            return res.status(404).send('No news found')
        }

        news.image = req.file.buffer
        await news.save()
        res.status(200).send()
    }catch(e) {
        res.status(400).send(e)
    }
})



module.exports = router