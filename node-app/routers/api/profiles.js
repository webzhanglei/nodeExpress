const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport"); // 身份验证中间件。
const mProfiles = require("../../models/m_profiles");
const mUser = require("../../models/m_user"); //引入刚才user表定义好的类型字段
const profileValidator = require("../../common/validator/profile"); //编辑验证js
const validateExperienceInput = require("../../common/validator/experience"); //添加个人经历
const validateEducationInput = require("../../common/validator/education"); //添加教育经历
router.get("/tst", (req, res) => {
    res.json({ test: "测试一下" });
});
// $route  GET api/profile
// @desc   获取当前登录用户的个人信息
// @access private
router.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // 查询数据库里是否有这个信息（user：查看模型定义m_profiles.js）
        //populate:查询关联表数据.populate('表名称', ['返回数据name名', 'email'])
        mProfiles
            .findOne({
                user: req.user.id
            })
            .populate("user", ["name", "email"])
            .then(profile => {
                //profile从数据库查到返回到信息
                if (!profile) {
                    return res.status(404).json({ msg: "用户信息不存在" });
                }
                res.json(profile);
            })
            .catch(err => res.status(404).json(err));
    }
);
// $route  POST api/profile
// @desc   创建和编辑个人信息
// @access private
router.post(
    "/edit",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { errors, isValid } = profileValidator(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const profileFields = {}; //定义数据类型，数据库类型是对象

        profileFields.user = req.user.id; //首先我们需要拿到用户ID，只要能进入这里面都能拿到这个ID

        // 进行数据判断，有的话进行赋值
        if (req.body.handle) profileFields.handle = req.body.handle;
        if (req.body.company) profileFields.company = req.body.company;
        if (req.body.website) profileFields.website = req.body.website;
        if (req.body.location) profileFields.location = req.body.location;
        if (req.body.status) profileFields.status = req.body.status;

        if (req.body.bio) profileFields.bio = req.body.bio;
        if (req.body.githubusername)
            profileFields.githubusername = req.body.githubusername;
        // skills - 数组转换（前端传过来的是字符串，数据库定义的是字符串数组，所以需要转换一下）
        if (typeof req.body.skills !== "undefined") {
            profileFields.skills = req.body.skills.split(",");
        }
        profileFields.social = {}; //数据库定义的是对象

        if (req.body.wechat) profileFields.social.wechat = req.body.wechat;
        if (req.body.QQ) profileFields.social.QQ = req.body.QQ;
        if (req.body.tengxunkt) profileFields.social.tengxunkt = req.body.tengxunkt;
        if (req.body.wangyikt) profileFields.social.wangyikt = req.body.wangyikt;
        // 查询数据
        mProfiles
            .findOne({
                user: req.user.id
            })
            .then(profile => {
                //  判断数据是否存在
                if (profile) {
                    //执行更新方法(id, update, options, callback)
                    /*
                              *id：指定_id的值；update：需要修改的数据；options控制选项；callback回调函数。
                              *options有以下选项：
                              *　　new： bool - 默认为false。返回修改后的数据。
                              *　　upsert： bool - 默认为false。如果不存在则创建记录。
                              *　　runValidators： 如果值为true，执行Validation验证。
                              *　　setDefaultsOnInsert： 如果upsert选项为true，在新建时插入文档定义的默认值。
                              *　　sort： 如果有多个查询条件，按顺序进行查询更新。
                              *　　select： 设置数据的返回。

                          */
                    console.log("走这里了");
                    // console.log("走这里了", profile);
                    console.log("走这里了req", req.user);
                    // res.json(req)
                    // return false;
                    mProfiles
                        .findOneAndUpdate({ user: req.user.id }, profileFields, {
                            new: true
                        })
                        .then(profile => res.json(profile));
                } else {
                    // 执行
                    mProfiles
                        .findOne({
                            handle: req.user.handle
                        })
                        .then(handle => {
                            if (handle) {
                                errors.handle = "该用户的handle个人信息已经存在,请勿重新创建!";
                                return res.status(400).json(errors);
                            }
                            new mProfiles(profileFields)
                                .save()
                                .then(profile => res.json(profile));
                        });
                }
            });
    }
);
// $route  GET api/profile/handle/:handle
// @desc   通过handle获取个人信息
// @access public
router.get("/handle/:handle", (req, res) => {
    // 通过传递过来的handle去查数据
    mProfiles
        .findOne({ handle: req.params.handle })
        .populate("user", ["name"])
        .then(profile => {
            if (!profile) {
                return res.status(404).json({ msg: "用户信息不存在" });
            }
            res.json(profile);
        });
});
// $route  GET api/profile/user/:user_id
// @desc   通过user_id获取个人信息
// @access public
router.get("/user/:user_id", (req, res) => {
    const errors = {};
    mProfiles
        .findOne({ user: req.params.user_id })
        .populate("user", ["name", "avatart"])
        .then(profile => {
            if (!profile) {
                errors.noprofile = "未找到该用户信息";
                res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});
// $route  GET api/profile/all
// @desc   获取所有人的信息
// @access public
router.get("/all", (req, res) => {
    const errors = {};
    //find()查询到所有的信息
    mProfiles
        .find()
        .populate("user", ["name", "avatart"])
        .then(profiles => {
            if (!profiles) {
                errors.noprofile = "没有任何用户信息";
                res.status(404).json(errors);
            }

            res.json(profiles);
        })
        .catch(err => res.status(404).json(err));
});
// $route  POST api/profile/experience
// @desc   添加个人经历
// @access Private
router.post(
    "/experience",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { errors, isValid } = validateExperienceInput(req.body);

        // 判断isValid是否通过
        if (!isValid) {
            return res.status(400).json(errors);
        }
        mProfiles.findOne({ user: req.user.id }).then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            };
            //找到对象中的experience，往里面添加数据
            profile.experience.unshift(newExp);
            profile.save().then(profile => {
                res.json(profile);
            });
        });
    }
);

// $route  POST api/profile/education
// @desc   添加个人学历
// @access Private
router.post(
    "/education",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { errors, isValid } = validateEducationInput(req.body);

        // 判断isValid是否通过
        if (!isValid) {
            return res.status(400).json(errors);
        }
        mProfiles.findOne({ user: req.user.id }).then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            };
            //找到对象中的education，往里面添加数据
            profile.education.unshift(newEdu);
            profile.save().then(profile => {
                res.json(profile);
            });
        });
    }
);
// $route  POST api/profile/experience/delete
// @desc   删除个人经历
// @access Private
router.delete(
    "/experience/:epx_id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        mProfiles
            .findOne({ user: req.user.id })
            .then(profile => {
                const removeIndex = profile.experience
                    .map(item => item.id)
                    .indexOf(req.params.epx_id);

                profile.experience.splice(removeIndex, 1);

                profile.save().then(profile => res.json(profile));
            })
            .catch(err => res.status(404).json(err));
    }
);



// $route  POST api/profile/education/delete
// @desc   删除教育经历
// @access Private
router.post(
    "/education/delete",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        mProfiles
            .findOne({ user: req.user.id })
            .then(profile => {
                // 通过ID去查找下标
                const removeIndex = profile.education
                    .map(item => item.id)
                    .indexOf(req.body.id);

                if (0 > removeIndex) {
                    return res.status(404).json({ msg: "该数据不存在" });
                }
                profile.education.splice(removeIndex, 1);
                profile.save().then(profile => {
                    res.json(profile);
                });
            })
            .catch(err => res.status(404).json(err));;
    }
);
// $route  DELETE api/profile
// @desc   删除整个用户
// @access Private
router.delete("/education/:edu_id", passport.authenticate('jwt', { session: false }), (req, res) => {
    mProfiles.findOneAndRemove({ user: req.user.id }).then(() => {
        mUser.findOneAndRemove({ _id: req.user.id }).then(() => {
            res.json({ success: true });
        });
    });
})

module.exports = router;