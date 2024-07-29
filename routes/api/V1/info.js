const { prisma } = require('../../../db');
const { parseData } = require('../../../utils/tools');
const router = require('express').Router();


//获取所有咨询分类
router.get('/article_categories', async (req, res) => {
    const data = await prisma.articleCategory.findMany({
        where: {},
        orderBy: {
            createdAt: 'desc'
        }
    });
    res.json(parseData(data))
});


//获取资讯数据
/**
 * 分页
 * 标题查询
 * 分类id查
 */
router.get('/articles', async (req, res) => {
    const per = (req.query.per || 10) * 1;
    const page = (req.query.page || 1) * 1;
    const where = {}
    if (req.query.cid) {
        where.articleCategoryId = req.query.cid
    }
    if (req.query.title) {
        where.title = {
            contains: req.query.title
        }
    }
    const count = await prisma.article.count({ where });
    const list = await prisma.article.findMany({
        where,
        include: {
            articleCategory: true
        },
        skip: (page - 1) * per,
        take: per,
        orderBy: {
            createdAt: 'desc'
        }
    });
    res.json(
        parseData({
            list,
            page,
            pages: Math.ceil(count / per),
            total: count
        })
    )
}
);


//根据id获取资讯详情
router.get('/articles/:id', async (req, res) => {
    const data = await prisma.article.findFirst({
        where: {
            id: req.params.id
        },
        include: {
            articleCategory: true
        }
    });

    //浏览量+1
    await prisma.article.update({
        where:{
            id: req.params.id
        },
        data:{
            views:{
                increment:1,
            }
        }
    })
    res.json(parseData(data))
});


//获取预约数据
router.get('/reservations', async (req, res) => {
    const per = (req.query.per || 10) * 1;
    const page = (req.query.page || 1) * 1;
    const where = {};
    if (req.query.title) {
        where.title = {
            contains: req.query.title
        }
    }
    const count = await prisma.reservation.count({ where });
    const list = await prisma.reservation.findMany({
        where,
        skip: (page - 1) * per,
        take: per,
        orderBy: {
            createdAt: 'desc'
        }
    });
    res.json(
        parseData({
            list,
            page,
            pages: Math.ceil(count / per),
            total: count
        })
    )
}
);


//根据id获取预约
router.get('/articles/:id', async (req, res) => {
    const data = await prisma.reservation.findFirst({
        where: {
            id: req.params.id
        },
    });

    //浏览量+1
    await prisma.reservation.update({
        where:{
            id: req.params.id
        },
        data:{
            views:{
                increment:1,
            }
        }
    })
    res.json(parseData(data))
});


module.exports = router;