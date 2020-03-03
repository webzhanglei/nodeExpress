// 登陆注册内容
const express = require("express");
const router = express.Router();
const mUser = require("../../models/m_user"); //引入刚才user表定义好的类型字段
const bcrypt = require("bcryptjs"); //加密工具
const gravatar = require("gravatar"); //存储头像
const jwt = require("jsonwebtoken"); //用来返回token
const passport = require("passport"); // 身份验证中间件。
const validatoRegisterInput = require('../../common/validator/register') //引入自己写的验证方法
const validatoLoginInput = require("../../common/validator/login"); //登陆验证
const secretOrKey = require("../../config/keys").secretOrKey;
router.get("/test", (req, res) => {
    res.json({ msg: "login woorks" });
});
// 注册接口
router.post("/register", (req, res) => {
    console.log("req", req.body);
    const { errors, isValid } = validatoRegisterInput(req.body);
    // 验证输入是否正确
    console.log("errors", errors);
    console.log("isValid", isValid);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    // res.json(req.body);
    // 查询数据库中是否拥有邮箱
    mUser.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(400).json({ email: "邮箱已被注册!" });
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: "200",
                r: "pg",
                d: "mm" //，没有返回一张默认图片
            });
            console.log("查询到了数据库么");
            const newUser = new mUser({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                avatar
            });
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(newUser.password, salt, function(err, hash) {
                    if (err) throw err;
                    newUser.password = hash; //处理加密后的密码
                    newUser
                        .save()
                        .then(v => {
                            res.json(v);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                });
            });
        }
        console.log("验证", res);
    });
});
//登陆接口,返回token
router.post("/login", (req, res) => {
    const { errors, isValid } = validatoLoginInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    mUser.findOne({ email: req.body.email }).then(user => {
        if (!user) {
            return res.status(404).json({ email: "用户不存在!" });
        }
        // 密码匹配，参数1：用户传过来的密码，参数2:数据库里面的密码
        bcrypt.compare(req.body.password, user.password, function(err, res1) {
            console.log("err", err);
            console.log("res", res1);
            if (err) throw err;
            // return false;
            if (!res1) {
                return res.status(400).json({ email: "密码不对!" });
            } else {
                //定义token规则
                const rule = {
                    id: user.id,
                    name: user.name
                };
                //jwt.sign('规则','加密名字','过期时间','箭头函数')
                jwt.sign(rule, secretOrKey, { expiresIn: 3600 }, (err, token) => {
                    if (err) throw err;
                    console.log("token", token);
                    res.json({ success: true, token: "Bearer " + token });
                });
            }
        });
    });
});
// 获取个人信息
router.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        console.log('够哦起', req)
        res.json({
            id: req.user.id,
            email: req.email,
            name: req.user.name
        });
    }
);

module.exports = router;