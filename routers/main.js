const expess = require('express');
const router = expess.Router();
const Category = require('../models/Category');
const Content = require('../models/Content');
const User = require('../models/User');
let data;
/*
* 处理通用的数据
* */
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
        categories: []
    }
    let categoriesArr = [];
    Category.find().then(function (categories) {
        let totalCount = 0;
        (function iterater(i) {
            if (i >= categories.length) {
                categoriesArr.unshift({ name: '全部', count: totalCount });
                data.categories = categoriesArr;
                return next();
            }
            Content.find({ category: categories[i]._id }).count().then(count => {
                const category = { name: categories[i].name, count: count };
                totalCount += count;
                categoriesArr.push(category);
                iterater(++i);
            });
        })(0);
    });
});

/*
* 首页
* */
router.get('/', function(req, res, next) {
    if(req.url === '/') {
        req.url = '/category/all/page/1';
        next();
    }
});

//获取全部分类内容分页
router.get('/category/all/page/:page', function(req, res) {
    const page = req.params.page;
    data.category = '';
        data.count = 0;
        data.page = Number(page);
        data.limit = 5;
        data.pages = 0;
        data.flag = false;
        Content.count().then(function(count) {

            data.count = count;
            //计算总页数
            data.pages = Math.ceil(data.count / data.limit);
            //取值不能超过pages
            data.page = Math.min( data.page, data.pages );
            //取值不能小于1
            data.page = Math.max( data.page, 1 );
            data.flag = data.page >= data.pages;
            var skip = (data.page - 1) * data.limit;

            return Content
                .find()
                .limit(data.limit)
                .skip(skip)
                .populate([{
                    path: 'category',
                    model: 'Category'
                }, {
                    path: 'user',
                    model: 'User'
                }]).sort({
                    createDate: -1
                });

        }).then(function(contents) {
            data.contents = contents;
            res.render('index', data);
        })
})

//获取单独分类内容首页
router.get('/category/:categoryName', function(req, res, next){
    const categoryName = req.params.categoryName;
    if(/^\/category\/*/.test(req.url)) {
        req.url = `/category/${categoryName}/page/1`;
        next();
    }
})

//获取单独分类内容分页
router.get('/category/:categoryName/page/:page', function(req, res, next) {
    const categoryName = req.params.categoryName;
    const page = req.params.page;
    Category.findOne({
        name : categoryName
    }).then(category => {
        if(category) {
            return category;
        }else {
            const err = new Error();
            err.status = 404;
            err.message = '分类不存在';
            next(err);
            return Promise.reject();
        };
    }).then(category => {
        data.categoryId = category._id;
        data.category = category.name;
        data.flag = false;
        data.count = 0;
        data.page = Number(page);
        data.limit = 5;
        data.pages = 0;
        var where = {};
        if (data.category) {
            where.category = data.categoryId
        }

        Content.where(where).count().then(function(count) {

            data.count = count;
            //计算总页数
            data.pages = Math.ceil(data.count / data.limit);
            //取值不能超过pages
            data.page = Math.min( data.page, data.pages );
            //取值不能小于1
            data.page = Math.max( data.page, 1 );
            data.flag = data.page >= data.pages;
            var skip = (data.page - 1) * data.limit;

            return Content
                .where(where)
                .find()
                .limit(data.limit)
                .skip(skip)
                .populate([{
                    path: 'category',
                    model: 'Category'
                },{
                    path: 'user',
                    model: 'User'
                }])
                .sort({
                    createDate: -1
                });
        }).then(function(contents) {
            data.contents = contents;
            res.render('index', data);
        })
    })
    
})

router.get('/view', function (req, res){

    var contentId = req.query.contentid || '';

    Content.findOne({
        _id: contentId
    })
    .populate([{
        path: 'category',
        model: 'Category'
    },{
        path: 'user',
        model: 'User'
    }])
    .then(function (content) {
        data.content = content;

        content.views++;
        content.save();

        res.render('view', data);
    });

});

module.exports = router;