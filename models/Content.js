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
    //内容标题
    title: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    //关联用户
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    //阅读量
    views: {
        type: Number,
        default: 0
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
    },
    //评论
    comments: {
        type: Array,
        default: []
    }
})

module.exports = mongoose.model('Content', contentSchema);