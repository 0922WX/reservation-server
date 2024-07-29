/**
 * 列表 分页显示
 * 新增
 * 修改
 * 获取单条记录(根据id取单条记录)
 * 删除多个
 * 删除单个
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
        const title = req.query.name;
        const count = await prisma.article.count({
            where:{
                content:title,
            }
        }); //获取总数
        const list = await prisma.article.findMany({
            where: {
                title:{
                    contains:title,
                }
            }, //查询条件
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
            await prisma.article.create({
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
        await prisma.article.update({
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
        const data = await prisma.article.findFirst({
            where: {
                id: req.params.id
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
        const { count } = await prisma.article.deleteMany({
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
        await prisma.article.delete({
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
