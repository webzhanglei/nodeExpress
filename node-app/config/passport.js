var JwtStrategy = require("passport-jwt").Strategy,
    ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const users = mongoose.model('users'); //需要用到用户表信息
const keys = require('./keys');
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

//passport接收参数
module.exports = passport => {

    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            console.log("opts", opts);
            //通过ID去查数据
            users.findById(jwt_payload.id).then(res => {
                if (res) {
                    return done(null, res)
                }
                console.log('走了这里')
                return done(null, false);
            }).catch(err => {
                console.log('没有数据', err)
            })

        })
    );

};