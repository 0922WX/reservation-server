const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //render 使用模板展示数据
  //参数一 表示模板页的路径，从视图文件夹开始找
  //参数二 表示数据
  res.render('index', { title: 'Express' });
});

module.exports = router;
