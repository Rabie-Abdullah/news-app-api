const express = require('express')
const router = new express.Router()

const Reporter = require('../models/reporter')
const auth = require('../middelware/auth')

const multer = require('multer')

//post user or sign up
router.post('/reporters',  async (req, res) => {
    try{
        const reporter = new Reporter(req.body)
        const token = await reporter.generateToken()

        await reporter.save()

        res.status(201).send({ reporter, token })
        
    } catch (e) {
        res.status(400).send(e)
    }
})

//login
router.post('/login', async (req, res) => {
    try{
        const reporter = await Reporter.findByCredentials(req.body.email, req.body.password)
        const token = await reporter.generateToken()
        res.status(200).send({ reporter, token })
        
    } catch (e) {
        res.status(400).send(e)
    }
})

//logout
router.delete('/logout', auth, async (req, res) => {
    try {
        req.reporter.tokens = req.reporter.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.reporter.save()
        res.send()

    } catch (e) {
        res.status(500).send(e)
    }
})
//logout from all sessions
router.post('/logoutAll', auth, async (req, res) => {
    try {
        req.reporter.tokens = []
        await req.reporter.save()
        res.send()

    } catch (e) {
        res.status(500).send(e)
    }
})
//Reporter profile
router.get('/reporters/profile', auth, async (req, res) => {
    res.send(req.reporter)
})
//for updating reporter data
router.patch('/reporters/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'password', 'phone']
    const validOperation = updates.every((update) => {
        allowedUpdates.includes(update)
    })

    if(!validOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        updates.forEach((update) => {
            req.reporter[update] = req.body[update]
        })
        await req.reporter.save()

        res.send(req.reporter)

    } catch (e) {
        res.status(400).send(e)
    }
})

//delete profile
router.delete('/reporters/:id', auth,async(req,res)=>{
    try{
         const _id = req.params.id
         const reporter = await Reporter.findByIdAndDelete(_id)
         if(!reporter){
             return res.status(404).send('Reporter not found')
         }
         res.status(200).send(reporter)
    }
    catch(error){
        res.status(500).send(error)
    }
   
    
})


const upload = multer({
    limits: {
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {

        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            return cb(new Error('please upload an image'))
        }
        cb(undefined, true)
    }
})


router.post('/profile/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        req.reporter.avatar = req.file.buffer
        await req.reporter.save()
        res.status(200).send()
    }catch(e) {
        res.status(400).send(e)
    }
})

router.delete('profile/avatar', auth, async (req, res) => {
    req.reporter.avatar = undefined
    await req.reporter.save()
    res.send()
})

module.exports = router