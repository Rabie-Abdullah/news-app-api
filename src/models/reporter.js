const validator = require('validator')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const News = require('./news')
const phone = require('phone')

const reporterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 18,
        validate(value) {
            if(value < 0) {
                throw new Error('Age must be positive number')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate(phone) {
            if(!validator.isMobilePhone(phone, "ar-EG")) {
                throw new Error('Invalid phone number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }

}, {
    timestamps: true
})



reporterSchema.virtual('news', {
    ref: 'News',
    localField: '_id',
    foreignField: 'owner'
})

reporterSchema.methods.toJSON = function () {
    const reporter = this
    const reporterObject = reporter.toObject()

    delete reporterObject.password
    delete reporterObject.tokens
    delete reporterObject.avatar

    return reporterObject
}

reporterSchema.methods.generateToken = async function () {
    const reporter = this
    const token = jwt.sign({ _id: reporter._id.toString()}, 'mysecretkey' )

    reporter.tokens = reporter.tokens.concat({ token })

    await reporter.save()

    return token
}


//find user by email & password to login
reporterSchema.statics.findByCredentials = async (email, password) => {
    const reporter = await Reporter.findOne({ email })

    if(!reporter) {
        throw new Error('this email does not exist')
    }

    const isMatch = await bcrypt.compare(password, reporter.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return reporter
}




//Hasing password by bcryptjs
reporterSchema.pre('save', async function (next)  {
    const reporter = this

    if(reporter.isModified('password')) {
        reporter.password = await bcrypt.hash(reporter.password, 8)
    }
    next()
})



const Reporter = mongoose.model('Reporter', reporterSchema)


module.exports = Reporter