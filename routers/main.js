const expess = require('express');
const router = expess.Router();
const Category = require('../models/Category');

router.get('/', (req, res, next) => {
    //读取所有分类信息
    Category.find().then(categories => {
        res.render('index', {
            userInfo: req.userInfo,
            categories
        })
    })
    
})

module.exports = router;