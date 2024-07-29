const { prisma } = require('../../../db');
const { getUserId, parseData, comaprePassword, encodePassword } = require('../../../utils/tools');

const router = require('express').Router();

router.get('/info',async (req,res) => {
    const id = getUserId(req.headers.authorization.split(' ')[1])
    const user = await prisma.user.findFirst({ where:{id}})
    delete user.password
    res.json(parseData(user,true,'获取用户信息成功'));
})


//修改密码
router.post('/change_pwd',async (req,res) => {
    const {oldPwd,newPwd} = req.body
    const id = getUserId(req.headers.authorization.split(' ')[1])
    if(oldPwd && newPwd){
       const user = await prisma.user.findFirst({ where:{id}})
       comaprePassword(oldPwd,user.password,isValidate =>{
           if(isValidate){
             //修改
            encodePassword(newPwd,async pwd =>{
                await prisma.user.update({
                    data:{
                        password:pwd
                    },
                    where:{
                        id
                    }
                });
                res.json(parseData('修改密码成功',true,'修改密码成功'))
            })
           } else{
                //输出
                res.json(parseData('原始密码错误',false,'原始密码错误'))
           }
       })

    } else{
        res.json(parseData('请输入原始密码和新密码',false,'请输入原始密码和新密码'))
    }
})


//修改用户信息
router.post('/change_info', async (req,res)=>{
    const {userName, password, nickName, avatar}  = req.body
    const id = getUserId(req.headers.authorization.split(' ')[1])
    await prisma.user.update({
        data:{
           nickName,
           avatar
        },
        where:{
            id
        }
    })
    res.json(parseData('修改用户信息成功',true,'修改用户信息成功'))
})


//获取指定用户预约记录
router.get('/reservation_logs',async (req,res)=>{
    const id = getUserId(req.headers.authorization.split(' ')[1])
    const data = await prisma.reservation_log.findMany({
        where:{
            userId:id
        },
        include:{
            reservation:true
        },
        orderBy:{
            createdAt:'desc'
        }
    })
    res.json(parseData(data,true,'获取预约记录成功'))
})



//预约
router.post('/reservation/:id' , async(req,res) =>{
    const id = getUserId(req.headers.authorization.split(' ')[1])
    await prisma.reservationLog.create({
        data:{
            reservationId:req.params.id,  //预约场次id
            mobile:req.body.mobile, //手机号
            name:req.body.name,  //姓名
            address:req.body.address,  //地址
            cardId:req.body.cardId,  //卡号
            userId:id   //用户id
        }
    })
    res.json(parseData('预约成功',true,'预约成功'))
})


module.exports = router;