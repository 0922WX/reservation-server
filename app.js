const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const { prisma } = require('./db');
const { encodePassword, parseData ,secretKey} = require('./utils/tools');
const cors = require('cors'); //跨域中间件


const app = express();//express实例
app.use(cors()) //使用跨域中间件

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//中间件
app.use(logger('dev'));//输出日志
app.use(express.json());//请求体数据格式化json
app.use(express.urlencoded({ extended: false }));//格式化 url编码
app.use(cookieParser()); // 解析cookie，将其转化为js对象
app.use(express.static(path.join(__dirname, 'public'))); //使用静态资源


//express-jwt 插件 用来对数据做验证
const jwtCheck = require('express-jwt').expressjwt({
  secret:secretKey,
  algorithms: ['HS256'] //签名方式
})


//使用自己写的路由模块
//参数一，path，url中的访问的地址
//参数二，处理函数
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/V1/common', require('./routes/api/V1/common'))



//登录部分
app.use('/api/V1/auth',require('./routes/api/V1/auth'))


//无需登录的前台部分
app.use('/api/V1/info',require('./routes/api/V1/info'))

app.use('/api/V1/users/*',jwtCheck)
app.use('/api/V1/users',require('./routes/api/V1/users'))





/**--------------------------------------------------------------------------------- */
//所有访问该地址的请求都验证
app.use('/api/V1/admin/*',jwtCheck) //开启服务器管理后端接口的token验证
app.use('/api/V1/admin/managers', require('./routes/api/V1/admin/managers'))
app.use('/api/V1/admin/article_categories',require('./routes/api/V1/admin/article_categories'))
app.use('/api/V1/admin/articles',require('./routes/api/V1/admin/articles'))
app.use('/api/V1/admin/reservations',require('./routes/api/V1/admin/reservations'))
app.use('/api/V1/admin/reservation_logs',require('./routes/api/V1/admin/reservation_logs'))
app.use('/api/V1/admin/users', require('./routes/api/V1/admin/users'))


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  res.json(parseData(err.message,false,'error',err.status || 500)) //json格式返回错误信息
});



initDbData();
//初始化数据库数据
async function initDbData(){
   const countAdmin =  await prisma.manager.count({
     where: {
      userName: 'admin'
     }
   })
   if(countAdmin === 0){
    encodePassword('admin',async pwd=>{
      await prisma.manager.create({
        data: {
          userName: 'admin',
          password: pwd,
          nickName: '管理员',
          avatar:'https://robohash.org/example'
     }
    })
    })
    
}
}


module.exports = app;
