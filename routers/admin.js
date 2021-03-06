const expess = require('express');
const router = expess.Router();
const User = require('../models/User');
const Category = require('../models/Category');
const Content = require('../models/Content');
const multiparty = require('multiparty'); //图片上传
const path = require('path');
const fs = require('fs');

router.use((req, res, next) => {
    // req.userInfo = { id: '5bdd0ad6d8cc5a1f50a3be43',
    // username: 'admin',
    // isAdmin: true };
    if(!req.userInfo.isAdmin) {
        res.send('对不起，您不是管理员');
        return;
    }
    next();
})

router.get('/', (req, res) => {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
})

//用户管理
router.get('/user', (req, res) => {

    //读取用户(设置分页)
    let page = Number(req.query.page || 1);
    const limit = 2;
    let pages = 0;

    User.count()
        .then(count => {

            //计算总页数
            pages = Math.ceil( count / limit );
            //取值不能超过总页数
            page = Math.min( page, pages );
            //取值不能小于1
            page = Math.max( page, 1 );
            const skip = ( page - 1) * limit;

            User.find({})
                .limit(limit)
                .skip(skip)
                .then(users => {
                    res.render('admin/user_index', {
                        userInfo: req.userInfo,
                        users,
                        page,
                        count,
                        limit,
                        pages
                    })
                })
        })
})

//分类首页
router.get('/category', (req, res) => {
    //读取用户(设置分页)
    let page = Number(req.query.page || 1);
    const limit = 2;
    let pages = 0;

    Category.count()
        .sort({
            _id: -1
        })
        .then(count => {

            //计算总页数
            pages = Math.ceil( count / limit );
            //取值不能超过总页数
            page = Math.min( page, pages );
            //取值不能小于1
            page = Math.max( page, 1 );
            const skip = ( page - 1) * limit;

            Category.find({})
                .limit(limit)
                .skip(skip)
                .then(categories => {
                    res.render('admin/category_index', {
                        userInfo: req.userInfo,
                        categories,
                        page,
                        count,
                        limit,
                        pages
                    })
                })
        });
    
})

//分类添加页面显示
router.get('/category/add', (req, res) => {
    res.render('admin/category_add', {
        userInfo: req.userInfo
    })
})

//分类保存
router.post('/category/add', (req, res) => {

    const name = req.body.name || '';
    if(name === '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: "名称不能为空",
            url: ''
        })
        return;
    };

    //查询数据库是否存在同名分类名称
    Category.findOne({
        name
    }).then(rs => {
        if(rs) {
            //数据库存在
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类已经存在',
                url: ''
            })
            return Promise.reject();
        };
        //数据库中不存在该分类
        return new Category({
            name
        }).save();
    }).then(newCategory => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类保存成功',
            url: '/admin/category'
        })
    })
})

//分类修改
    router.get('/category/edit', (req, res) => {
        //获取要修改的分类的信息
        const id = req.query.id || '';
        Category.findOne({
            _id: id
        }).then(category => {
            if(!category){
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: '分类信息不存在',
                    url: ''
                })
                return Promise.reject();
            }
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category
            })
        })
    })

//分类修改的保存
    router.post('/category/edit', (req, res) => {
        const id = req.query.id || '';
        const name = req.body.name || '';
        Category.findOne({
            _id: id
        }).then(category => {
            if(!category){
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: '分类信息不存在',
                    url: ''
                })
                return Promise.reject();
            }
            //当用户没有做任何修改
            if(name === category.name) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '修改成功',
                    url: '/admin/category'
                })
                return Promise.reject();
            }else {
                //要修改的名称是否和数据库中的名称相同
                return Category.findOne({
                    _id: { $ne: id },
                    name
                })
            }
        }).then(sameCategory => {
            if(sameCategory) {
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: '数据库中已经存在同名分类',
                    url: ''
                });
                return Promise.reject();
            }else {
                return Category.update({
                    _id: id
                },{
                    name: name
                });
            };
        }).then(() => {
            res.render('admin/success', {
                userInfo: req.userInfo,
                message: '修改成功',
                url: '/admin/category'
            })
        })
    })


//分类删除
router.get('/category/delete', (req, res) => {
    const id = req.query.id || '';
    Category.remove({
        _id: id
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/category'
        })
    })
})

//内容首页
router.get('/content', (req, res) => {

     //读取用户(设置分页)
     let page = Number(req.query.page || 1);
     const limit = 2;
     let pages = 0;
 
     Content.count()
         .sort({
             _id: -1
         })
         .then(count => {
 
             //计算总页数
             pages = Math.ceil( count / limit );
             //取值不能超过总页数
             page = Math.min( page, pages );
             //取值不能小于1
             page = Math.max( page, 1 );
             const skip = ( page - 1) * limit;
 
             Content.find({})
                 .sort({_id: -1})
                 .limit(limit)
                 .skip(skip)
                 .populate([{
                     path: 'category',
                     model: 'Category'
                 }, {
                    path: 'user',
                    model: 'User'
                 }])
                 .then(contents => {
                     res.render('admin/content_index', {
                         userInfo: req.userInfo,
                         contents,
                         page,
                         count,
                         limit,
                         pages
                     })
                 })
         });
     
})

//内容添加页面
router.get('/content/add', (req, res) => {
    Category.find()
        .sort({_id: -1})
        .then(categories => {
            res.render('admin/content_add', {
                userInfo: req.userInfo, 
                categories
            })
        })
})

//内容保存
router.post('/content/add', (req, res) => {
    try {
        fs.mkdirSync('./upload');
        throw new Error('添加错误');
    } catch (e) {
        var form = new multiparty.Form();
        form.uploadDir = "upload";
        form.parse(req, function(err, fields, files) {
            //内容分类不能为空
            if(fields.category === '') {
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: '内容分类不能为空',
                    url: ''
                })
                return;
            };
            if(fields.title === '') {
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: '内容标题不能为空',
                    url: ''
                })
                return;
            };

            //保存数据到数据库
            const { category, title, description, content } = fields
            const uploadImg = files.upload[0];
            const textTemp = files.files[0];
            let setOpts = null;
            if(uploadImg.originalFilename === '') {
                setOpts = {
                    category,
                    title,
                    user: req.userInfo.id, 
                    description,
                    content,
                    image: ''
                };
                //删除图片上传缓存
                fs.unlinkSync(path.join(__dirname, '..', uploadImg.path));
            }else {
                const image = "/" + uploadImg.path;
                setOpts = {
                    category,
                    title,
                    user: req.userInfo.id, 
                    description, 
                    content,
                    image
                };
            }
            //删除markdown图片上传缓存
            fs.unlinkSync(path.join(__dirname, '..', textTemp.path));
            new Content(setOpts).save().then(rs => {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '内容保存成功',
                    url: '/admin/content'
                })
            });
        });
    }
})

//内容修改页面
router.get('/content/edit', (req, res) => {
    const id = req.query.id || '';
    let categories = [];
    Category.find({})
        .sort({_id: -1})
        .then(rs => {
            categories = rs;
            return Content.findOne({_id: id}).populate({
                path: 'category',
                model: 'Category'
            })
        })
        .then(content => {
            if(!content) {
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: '内容不存在',
                    url: ''
                });
                return Promise.reject();
            };
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                content,
                categories,
                defaultCategory: content.category
            });
        })
})

//保存修改内容
router.post('/content/edit', (req, res) => {
    const id = req.query.id || '';
    var form = new multiparty.Form();
    form.uploadDir = "upload";
    form.parse(req, function(err, fields, files) {
        //内容分类不能为空
        if(fields.category === '') {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '内容分类不能为空',
                url: ''
            })
            return;
        };
        if(fields.title === '') {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '内容标题不能为空',
                url: ''
            })
            return;
        };
        const file = files.upload[0];
        const textTemp = files.files[0];
        let setOpts;
        const {category, title, oldPath, description, content} = fields;
        if(file.originalFilename === '') {
            setOpts = {
                category, 
                title, 
                description, 
                content
            }
            //清除临时上传文件
            fs.unlinkSync(path.join(__dirname, '..', file.path));
        }else {
            const image = "/" + file.path;
            setOpts = {
                category, 
                title, 
                description, 
                content,
                image
            };
            //清除旧的图片
            if(oldPath !== '') {
                fs.unlinkSync(path.join(__dirname, '..', oldPath[0]));
            }
        }
        //清除markdown临时上传文件
        fs.unlinkSync(path.join(__dirname, '..', textTemp.path));
        Content.update({
            _id: id
        }, {$set: setOpts}).then(() => {
            res.render('admin/success', {
                userInfo: req.userInfo,
                message: '内容保存成功',
                url: '/admin/content'
            })
        });
    })
    
})

//内容删除
router.get('/content/delete', (req, res) => {
    const id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(() => {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/content'
        })
    })
})
module.exports = router;