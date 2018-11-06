const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    //用户名
    username: {
        type: String,
        require: true, //必须
        unique: true //唯一
    },
    //密码
    password: {
        type: String,
        require: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createDate: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', userSchema);