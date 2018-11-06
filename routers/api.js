const expess = require('express');
const router = expess.Router();
const User = require('../models/User');

router.use((req, res, next) => {
    responseData = {
        code: 0,
        message: ''
    };
    next();
})

//注册
router.post('/user/register', (req, res, next) => {
    const { username, password, repassword } = req.body;
    // 用户名为空
    if( username === '' ) {
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        return res.json(responseData);
    }
    //密码为空
    if( password === '' ) {
        responseData.code = 2;
        responseData.message = '密码不能为空';
        return res.json(responseData);
    }
    //两次密码不一致
    if( repassword !== password ) {
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        return res.json(responseData);
    }
    User.findOne({ username }).then( userInfo => {
        if( userInfo ) {
            responseData.code = 4;
            responseData.message = "用户名已经注册";
            res.json(responseData);
            return;
        }
        var user = new User({
            username,
            password
        })
        return user.save();
    }).then(newUserInfo => {
        responseData.message = "注册成功";
        res.json(responseData);
    });
})

//登陆
router.post('/user/login', (req, res) => {
    const { username, password } = req.body;

    if( username === '' || password === '') {
        responseData.code = 1;
        responseData.message = '用户名或者密码不能为空';
        res.json(responseData);
        return;
    };

    //查询数据库中是否有相同的用户名以及密码
    User
        .findOne({ username })
        .then(isUserName => {
            if(!isUserName) {
                responseData.code = 2;
                responseData.message = "用户名不存在"
                res.json(responseData);
                return;
            };
            User
                .findOne({ username, password })
                .then(userInfo => {
                    if(!userInfo) {
                        responseData.code = 3;
                        responseData.message = "密码不正确"
                        res.json(responseData);
                        return;
                    };
                    //用户名和密码正确
                    responseData.message = "登陆成功";
                    responseData.userInfo = {
                        id: userInfo._id,
                        username: userInfo.username
                    }
                    req.session.userInfo = responseData.userInfo;
                    res.json(responseData);
                })
        })
})

//退出登陆
router.get('/user/logout', (req, res) => {
    //销毁session
    req.session.destroy(err => {
        if(err) {
            console.log(err);
            return;
        }
        res.json(responseData);
    })
})


module.exports = router;