const express = require("express");
// 用的mongDB的数据库
const mongoose = require("mongoose");
// 解析中间件，处理程序之前，在中间件中对传入的请求体进行解析，提供四种解析器JSON body parser，Raw body parser；Text body parser；URL-encoded form body parser
const bodyParser = require("body-parser");
const app = express();
// 身份验证中间件。
const passport = require('passport'); //

//获取数据库地址
const db = require("./config/keys").mongoURL;

// 引入user.js接口文件
const users = require("./routers/api/users");
const profiles = require("./routers/api/profiles");
const posts = require("./routers/api/posts");
// 链接数据库
mongoose
    .connect(db, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log("连接成功"))
    .catch(err => console.log("连接失败", db));
//在程序中使用了findOneAndUpdate()或者findOneAndDelete()需要设置，不然会报错哦
mongoose.set("useFindAndModify", false);
// 使用中间件允许跨越
app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        next();
    })
    // 使用passport身份验证中间件，引入单独写的js并把传递passport过去
require("./config/passport")(passport);
//建立一个路由
app.get("/", (req, res) => {
    res.send("hello world1223");
});
// 使用body-parser中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// 初始化身份验证中间件。
app.use(passport.initialize());
// 使用routers
app.use("/api/users", users);
app.use("/api/profiles", profiles);
app.use("/api/posts", posts);
// 设置端口号
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`启动${port}`);
    // console.log(bodyParser);
});