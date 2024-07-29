const { comaprePassword , generateToken,parseData, encodePassword } = require('../../../utils/tools');
const {prisma} = require('../../../db');
const router = require('express').Router();

//注册
router.post('/reg',async(req,res) =>{
    const {userName,password,nickName,avatar} = req.body
    if(userName && password){
        const counter = await prisma.user.count({where:{userName}})
        if(counter>0){
            res.json(parseData('用户名已存在',false,'用户名已存在'))
        }else{
            encodePassword(password,async(hashPassword) =>{
                const user = await prisma.user.create({
                    data:{
                        userName,
                        password:hashPassword,
                        nickName,
                        avatar
                    }
                })
                res.json(parseData(generateToken(user),true,'注册成功'))
            })
        }
    }else{
        res.json(parseData('用户名和密码不能为空',false,'请输入用户名和密码'))
    }
})

//登录
router.post('/login',async(req,res) =>{
    const {userName,password} = req.body
    if(userName && password){
        const user = await prisma.user.findFirst({
            where:{
                userName
            }
        })
        if(user){
            comaprePassword(password,user.password,(isValidate) => {
                if(isValidate){
                    res.json(parseData(generateToken(user),true,'登录成功'))
                }else{
                    res.json(parseData('密码错误',false,'密码错误'))
                }
            })
        }else{
            res.json(parseData('用户信息不存在',false,'用户信息不存在'))
        }
    }else{
        res.json(parseData('用户名和密码不能为空',false,'请输入用户名和密码'))
    }
})




/**
 * 管理员登陆
 */
router.post('/admin_login', async(req, res) => {
    const {userName,password} =req.body
    if(userName && password){
        //获取用户信息
        const manager =await prisma.manager.findFirst({
            where:{
                userName
            }
        })

        if(manager){
            comaprePassword(password,manager.password,async(isValidate) => {
                if(isValidate){
                    //密码正确,表示登录成功，需要生成token
                    //JWT验证
                 const token =  generateToken(manager)
                 res.json(parseData(token,true,'登录成功'))
           
                } else {
                    res.json(parseData('密码错误',false,'密码错误'))
                }
            })
        }else{
            res.json(parseData('用户名信息不存在',false,'用户名信息不存在'))
        }
    }else{
        res.json(parseData('用户名和密码不能为空',false,'请输入用户名和密码'))
    }
});



module.exports = router;