const express = require('express');
const app = express();
//连接数据库
const mongoose = require('mongoose');
//用来处理post请求
const bodyParser = require('body-parser');
//session
const session = require('express-session');
const User = require('./models/User');


//设置session信息
app.use(session({
    secret: "keycode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30
    },
    rolling: true
}));

//设置静态文件托管
app.use(express.static(__dirname+"/public"));

//设置模板引擎ejs
app.set('view engine', 'ejs')

//设置图片上传虚拟路径
app.use("/upload", express.static(__dirname + "/upload"));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());



//解析session信息
app.use((req, res, next) => {
    req.userInfo = {};
    const { userInfo } = req.session;
    if(userInfo) {
        try{
            req.userInfo = userInfo;
            User.findById(req.userInfo.id).then(userInfo => {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        }catch(e){
            next();
        };
    }else{
        next();
    }
})

/*
    根据不同功能划分模块
*/
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));


mongoose.connect('mongodb://localhost:27017/blog', err => {
    if(err) {
        console.log(err);
        return;
    }
    console.log('数据库连接成功！');
})

//处理错误
app.use(function(err, req, res, next) {
    console.error(err.status, err.message);
    res.status(err.status).send(err.message);
})

app.listen(3000, err => {
    if(err){
        return console.log(err);
    }
    console.log(`server-port: http://localhost:3000`);
});