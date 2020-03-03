// 创建数据模型
const mongoose = require("mongoose");
const Schema = mongoose.Schema; //实例化Schema

const profilesSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "users" //ref:和哪个表关联（user）
    },
    handle: {
        type: String,
        required: true,
        max: 40 //最大值
    },
    company: {
        type: String
    },
    website: {
        type: String
    },
    location: {
        type: String
    },
    status: {
        type: String,
        required: true
    },
    skills: {
        type: [String], //字符串数组
        required: true
    },
    bio: {
        type: String
    },
    githubusername: {
        type: String
    },
    experience: [
        //个人经历
        {
            current: {
                type: Boolean,
                default: true
            },
            title: {
                type: String,
                required: true
            },
            company: {
                //从事的公司
                type: String,
                required: true
            },
            location: {
                type: String
            },
            from: {
                type: String,
                require: true
            },
            to: {
                type: String
            },
            description: {
                type: String
            }
        }
    ],
    education: [
        //教育
        {
            current: {
                type: Boolean,
                default: true
            },
            school: {
                type: String,
                required: true
            },
            degree: {
                type: String,
                required: true
            },
            fieldofstudy: {
                type: String,
                required: true
            },
            from: {
                type: String,
                require: true
            },
            to: {
                type: String
            },
            description: {
                type: String
            }
        }
    ],
    social: {
        wechat: {
            type: String
        },
        QQ: {
            type: String
        },
        tengxunkt: {
            type: String
        },
        wangyikt: {
            type: String
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
});
module.exports = profile = mongoose.model("profile", profilesSchema);