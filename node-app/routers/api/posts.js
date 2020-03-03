const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport"); // 身份验证中间件。
//数据模型
const mPosts = require("../../models/m_posts");
const mProfile = require("../../models/m_profiles");
//
const validatePostInput = require("../../common/validator/posts");

// $route  POST api/posts
// @desc   创建一个评论接口
// @access Private
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const { errors, isValid } = validatePostInput(req.body);

        // 判断isValid是否通过
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const newPost = new mPosts({
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        });
        newPost.save().then(posts => {
            console.log(posts);
            res.json(posts);
        });
    }
);
// $route  GET api/posts
// @desc   获取评论信息
// @access public
router.get("/list", (req, res) => {
    //根据时间做一个倒序，.sort({date: -1})
    mPosts
        .find()
        .sort({ date: -1 })
        .then(post => {
            res.json(post);
        });
});
// $route  GET api/posts/:id
// @desc   获取单个评论信息
// @access public
router.get("/list/:id", (req, res) => {
    mPosts.findById(req.params.id).then(post => {
        res.json(post);
    });
});
// $route  DELETE api/posts/delete
// @desc   删除单个评论信息
// @access Private
router.post(
    "/delete",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        mProfile.findOne({ user: req.user.id }).then(profile => {
            // res.json(profile);
            mPosts
                .findById(req.body.id)
                .then(post => {
                    // 判断用户信息是否正确
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({ msg: "用户非法操作!" });
                    }
                    //删除
                    post.remove().then(() => res.json({ success: true }));
                })
                .catch(err => res.status(404).json({ msg: "没有找到该条数据" }));
        });
    }
);
// $route  POST api/posts/likes
// @desc   点赞接口
// @access Private
//参数，id;state:1点赞，0取消

router.post(
    "/likes",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        let state = Number(req.body.state);
        mProfile.findOne({ user: req.user.id }).then(profile => {
            mPosts
                .findById(req.body.id)
                .then(post => {
                    if (state === 1) {
                        if (
                            post.likes.filter(like => like.user.toString() === req.user.id)
                            .length > 0
                        ) {
                            return res.status(400).json({ alreadyliked: "该用户已赞过" });
                        }
                        post.likes.unshift({ user: req.user.id });

                        post.save().then(post => res.json(post));
                    } else {
                        if (
                            post.likes.filter(like => like.user.toString() === req.user.id)
                            .length === 0
                        ) {
                            return res.status(400).json({ notliked: "该用户没有点过赞" });
                        }
                        const removeIndex = post.likes
                            .map(item => item.user.toString())
                            .indexOf(req.user.id);

                        post.likes.splice(removeIndex, 1);

                        post.save().then(post => res.json(post));
                    }
                })
                .catch(err => res.status(404).json({ likederror: "点赞错误" }));
        });
    }
);

// $route  POST api/posts/comment/:id
// @desc   添加评论接口
// @access Private
router.post(
    "/comment/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        mProfile.findOne({ user: req.user.id }).then(profile => {
            mPosts.findById(req.params.id).then(post => {
                const { errors, isValid } = validatePostInput(req.body);

                // 判断isValid是否通过
                if (!isValid) {
                    return res.status(400).json(errors);
                }
                const newComment = {
                    text: req.body.text,
                    name: req.body.name,
                    avatar: req.body.avatar,
                    user: req.user.id
                }
                post.comments.unshift(newComment);
                post.save().then(post => {
                    res.json(post)
                })
            });
        });
    }
);
// $route  POST api/posts/comment/delete
// @desc   删除评论接口
// @access Private
//参数 ：pid,id
router.post(
    "/cDelete",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // console.log("报错么");
        // return false;
        mProfile.findOne({ user: req.user.pid }).then(profile => {
            mPosts.findById(req.body.pid).then(post => {
                console.log("removeIndex", post);
                // return false;
                if (req.body.pid != 0) {
                    if (
                        post.comments.filter(
                            comment =>
                            comment._id.toString() === req.body.id
                        ).length === 0
                    ) {
                        return res
                            .status(404)
                            .json({ commentnotexists: "该评论不存在" });
                    } else {
                        // 找到该评论的index
                        const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.body.id);
                        post.comments.splice(removeIndex, 1);
                        post.save().then(post => {
                            res.json(post)
                        })
                    }
                }
            })
        })
    });
module.exports = router;