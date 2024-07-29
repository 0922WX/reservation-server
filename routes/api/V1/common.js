const fs = require('fs')
const path = require('path')
const router = require('express').Router()
const multer = require('multer')
const { parseData ,generateQrcode} = require('../../../utils/tools')

//如果上传目录不存在，那么就先创建
if (!fs.existsSync('./public/uploads')) {
  fs.mkdirSync('./public/uploads', {
    recursive: true
  })
}

//来源于https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md
const storage = multer.diskStorage({
  //目录
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },

  //文件名
  filename: function (req, file, cb) {
    cb(
      null, 
      Math.round(Math.random() * 1e9)+
      file.fieldname + 
      '-' + 
      Date.now() + 
      path.extname(file?.originalname))
  }
})

const upload = multer({ storage: storage })



//文件上传，属性名为file
router.post('/upload', upload.single('file'), (req, res) => {
  //获取上传之后的文件名输出
    res.json(parseData('/uploads/' + req.file.filename))
})

//生成二维码
router.get('/qrcode', (req, res) => {
  const data = req.query.data
  generateQrcode(data,(url) =>{
    res.json(parseData(url))
})
})


module.exports = router



//使用multer来文件上传
