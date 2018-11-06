const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
    //分类名称
    name: {
        type: String
    },
    //创建时间
    createDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Category', categoriesSchema);