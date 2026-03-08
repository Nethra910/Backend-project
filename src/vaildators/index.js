import { body } from "express-validator"

const userRegisterValidator = () => {
    return [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invaild"),
    body("userName")
        .trim()
        .notEmpty()
        .withMessage("UserName is required")
        .isLowercase()
        .withMessage("UserName should be in lowercase")
        .isLength({min: 3})
        .withMessage("User name must be atleast 3 characters"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
    ]
}
const userLoginValidator = ()=>{
    return[
        body("email")
            .optional()
            .isEmail()
            .withMessage("Email is invaild"),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ]
}
const userChangeCurrentPasswordValidator = ()=>{
    return [
        body("oldPassword")
            .notEmpty()
            .withMessage("Old password is required"),
        body("newPassword")
            .notEmpty()
            .withMessage("new password is required")
    ]
}
const userForgotPasswordValidator = ()=>{
    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmpty()
            .withMessage("Email is invalid")
    ]
}
const userResetForgotPasswordValidator = ()=>{
    return [
        body("newPassword")
            .notEmpty()
            .withMessage("Password is required")
    ]
}

export { userRegisterValidator,userLoginValidator,
    userChangeCurrentPasswordValidator,
    userForgotPasswordValidator,
    userResetForgotPasswordValidator
 }