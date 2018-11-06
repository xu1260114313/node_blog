const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contentSchema = new Schema({
    //关联字段
    category: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Category'
    },
    //分类标题
    title: {
        type: String,
        required: true
    },
    //简介
    description: {
        type: String,
        default: ''
    },
    //内容
    content: {
        type: String,
        default: ''
    },
    //创建时间
    createDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Content', contentSchema);