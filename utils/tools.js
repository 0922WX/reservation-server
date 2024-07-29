const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');

/**格式化返回结果
 * @param {*} data
 * @param {*} success
 * @param {*} errormessage
 * @param {*} errorCode
 * @returns 返回的数据
*/
function parseData(
    data = {},
    success = true,
    errormessage = '',
    errorCode = ''
) {
    return {
        success,
        data,
        errormessage,
        errorCode
    }
}


const saltRounds = 10;


/**
 * 加密
 * @param {*} password   原始密码
 * @param {*} cb 回调函数
 */
function encodePassword(password, cb) {
    bcrypt.hash(password + "", saltRounds, (err, hash) => {
        if (err) throw err;
        cb(hash);
    })
}

/**
 * 验证密码
 * @param {*} password  密码
 * @param {*} hash 加密后密码
 * @param {*} cb  回调函数，返回一个布尔值
 */
function comaprePassword(password, hash, cb) {
    bcrypt.compare(password + "", hash, (err, res) => {
        if (err) throw err;
        cb(res);
    })
}

/**
 * 生成token
 * @param {*} user  用户对象
 * @returns token    返回token
 */
const secretKey = 'wangxiao-key'
function generateToken(user) {
    const token = jwt.sign(
        {
            userId: user.id,
        },
        secretKey,
        { expiresIn: '5h' }
    );
    return token;
}


function getUserId(token){
    return jwt.verify(token, secretKey).userId
}


/**
 * 生成二维码
 * @param {*} data 
 * @param {*} cb 
 */
function generateQrcode(data, cb) {
    qrcode.toDataURL(data,{},(err,url) =>{
        cb(url);
    })
}



module.exports = {
    parseData,
    encodePassword,
    comaprePassword,
    generateToken,
    secretKey,
    getUserId,
    generateQrcode
}
