const mongoose = require('mongoose')



const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        maxlength: 70
    },
    discription: {
        type: String,
        trim: true,
        required: true
    },
    category: {
        type: String,
        trim: true,
        required: true
    },
    image: {
        type: Buffer
    }
    ,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Reporter'
    }
    
}, {
    timestamps: true
})


const News = mongoose.model('News', newsSchema)

module.exports = News