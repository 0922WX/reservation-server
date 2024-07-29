/**
 * 预约记录
 * 列表
 *  分页
 *  名字，手机号
 *  根据用户id查找,用于用户列表上的查看预约记录功能
 *  根据预约id查找,用于预约信息列表上查看预约记录功能
 * 修改
 * 删除
 * 删除多个
 */
const router = require('express').Router();
const { prisma } = require('../../../../db')
const { parseData} = require('../../../../utils/tools')

/**
 * 列表
 */
router.get('/', async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10 } = req.query || {};  //req.query获取url参数,?page=2&pageSize=10
        const name = req.query.name;//名字
        const mobile = req.query.mobile;//手机号
        const userId = req.query.userId;//用户id
        const reservationId = req.query.reservationId; //预约id

        const query ={}
        if(name){
            query.name = {
                contains:name
            }
        }
        if(mobile){
            query.mobile = {
                contains:mobile
            }
        }
        if(userId){
            query.userId = userId
        }
        if(reservationId){
            query.reservationId =reservationId
        }

        const count = await prisma.reservationLog.count({where:query}); //获取总数
        const list = await prisma.reservationLog.findMany({
            where:query, //查询条件
            skip: (page * 1 - 1) * pageSize, //跳过指定的数量
            take: pageSize * 1, //获取指定数量数据
            //关联查询
            include: {
                user: true,
                reservation: true,
            },
            //排序，按时间倒序
            orderBy: {
                createdAt: 'desc'
            },
        });
        res.json(
            parseData(
                {
                    data: list.map((item) => {
                        delete item.password;
                        return item;
                    }),
                    page: page * 1,
                    pages: Math.ceil(count / pageSize),
                    total:count,
                },
                true,
                '获取成功'
            )
        )
    } catch (err) {
        next(err)
    }

})


/**
 * 新增
 */
router.post('/', async (req, res, next) => {
        try {
            await prisma.reservationLog.create({
                data: req.body,
            });
            res.json(parseData({}, true, '新增成功'));
        } catch (err) {
            next(err)
        }
})

/**
 * 修改,依据id
 */
router.put('/:id', async (req, res, next) => {
    try {
        await prisma.reservationLog.update({
            data: req.body,
        })
        res.json(parseData({}, true, '修改成功'));
    } catch (err) {
        next(err)
    }
})



/**
 * 获取单条记录,不含密码
 */
router.get('/:id', async (req, res, next) => {
    try {
        const data = await prisma.reservationLog.findFirst({
            where: {
                id: req.params.id
            },
            include:{
                user: true,
                reservation: true,
            }
        });
        res.json(parseData(data, true, '获取成功'))
    } catch (err) {
        next(err)
    }
})


/**
 * 删除多个
 * 使用url传参，多个id用逗号隔开
 * 如:?ids=1,2,3
 */
router.delete('/delete_many', async (req, res, next) => {
    try {
        const { count } = await prisma.reservationLog.deleteMany({
            where: {
                id: {
                    in: req.query.ids.split(',')
                }
            }
        })
        res.json(parseData(count, true, '删除多条记录成功'))
    } catch (err) {
        next(err)
    }

})

/**
 * 根据id删除一个
 */
router.delete('/:id', async (req, res, next) => {
    try {
        await prisma.reservationLog.delete({
            where: {
                id: req.params.id
            }
        })
        res.json(parseData({}, true, '删除成功'))
    } catch (err) {
        next(err)
    }

})



module.exports = router;
