const validator = require("validator"); //验证
const isEmpty = require("./isEmpty");
module.exports = function validateLoginInput(data) {
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email : "";
    data.password = !isEmpty(data.password) ? data.password : "";

    if (!validator.isEmail(data.email)) {
        errors.email = "邮箱不合法!";
    }

    if (validator.isEmpty(data.email)) {
        errors.email = "邮箱不能为空!";
    }

    if (validator.isEmpty(data.password)) {
        errors.password = "密码不能为空!";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};