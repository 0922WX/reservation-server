/**
 * 列表 分页显示
 * 新增
 * 修改
 * 修改密码
 * 获取单条记录(根据id取单条记录)
 * 获取当前登录用户信息，通过token
 * 删除多个
 * 删除单个
 */
const router = require('express').Router();
const { prisma } = require('../../../../db')
const { parseData, encodePassword ,getUserId} = require('../../../../utils/tools')

/**
 * 列表
 */
router.get('/', async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10 } = req.query || {};  //req.query获取url参数,?page=2&pageSize=10
        const count = await prisma.manager.count({}); //获取总数
        const list = await prisma.manager.findMany({
            where: {}, //查询条件
            skip: (page * 1 - 1) * pageSize, //跳过指定的数量
            take: pageSize * 1, //获取指定数量数据
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
                }
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
    encodePassword(req.body.password, async pwd => {
        try {
            await prisma.manager.create({
                data: {
                    userName: req.body.userName,
                    password: pwd,
                    nickName: req.body.nickName,
                    avatar: req.body.avatar,
                }
            });
            res.json(parseData({}, true, '新增成功'));
        } catch (err) {
            next(err)
        }

    })
})

/**
 * 修改,依据id
 */
router.put('/:id', async (req, res, next) => {
    try {
        await prisma.manager.update({
            data: {
                nickName: req.body.nickName,
                avatar: req.body.avatar,
            },
            where: {
                id: req.params.id
            }
        })
        res.json(parseData({}, true, '修改成功'));
    } catch (err) {
        next(err)
    }
})


/*
*修改密码
*/
router.put('/:id/reset_pwd', async (req, res) => {
    encodePassword(req.body.password, async pwd => {
        prisma.manager.update({
            data: {
                password: pwd,
            },
            where: {
                id: req.params.id
            }
        })
    })
    res.json(parseData({}, true, '修改密码成功'));
})


/**
 * 获取当前用户的登录信息,需要token
 */
router.get('/info', async (req, res, next) => {
    const id = getUserId(req.headers.authorization.split(' ')[1]);  //获取token中的id
    const user = await prisma.manager.findFirst({
        where:{id}
    })
    delete user.password;
    res.json(parseData(user))
})


/**
 * 获取单条记录,不含密码
 */
router.get('/:id', async (req, res, next) => {
    try {
        const data = await prisma.manager.findFirst({
            where: {
                id: req.params.id
            }
        });
        delete data.password;
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
        const { count } = await prisma.manager.deleteMany({
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
        await prisma.manager.delete({
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
