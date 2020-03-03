//注册验证
const validator = require("validator"); //验证
const isEmpty = require("./isEmpty");
module.exports = function validatoRegisterInput(data) {
    console.log("data", data);
    console.log(validator.isLength(data.name, { min: 2, max: 30 }));
    let errors = {};
    data.name = !isEmpty(data.name) ? data.name : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.password2 = !isEmpty(data.password2) ? data.password2 : "";

    if (validator.isEmpty(data.name)) {
        errors.name = "名字不能为空";
    } else if (!validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = "您的名字长度不能小于两位且不能大于30位";
    } else if (!validator.isEmpty(data.email)) {
        errors.name = "邮箱不能为空";
    } else if (!validator.isEmail(data.email)) {
        errors.name = "邮箱合法";
    } else if (validator.isEmpty(data.password)) {
        errors.password = "密码不能为空!";
    } else if (!validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = "密码的长度不能小于6位并且不能大于30位!";
    } else if (validator.isEmpty(data.password2)) {
        errors.password2 = "确认密码不能为空!";
    } else if (!validator.equals(data.password, data.password2)) {
        errors.password2 = "两次不一致!";
    }
    return {
        errors,
        isValid: isEmpty(errors)
    };
};