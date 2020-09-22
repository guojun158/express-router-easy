// 核心模块
const http = require('http');
const path = require('path')
const fs = require('fs')
const querystring = require('querystring');
const ejs = require('ejs');
// 导入路由
const app = require('./module/route');
// 自定义模块
const util = require('./utils');
// 启动服务
const server = http.createServer(app);

// 配置静态资源目录
app.static('./public');
// 配置路由
app.get('/', function (req, res) { // 首页 GET
  ejs.renderFile('./views/index.ejs', { title: '首页', list: ['node', 'express', 'koa2', 'egg', 'mysql']}, (err, data) => {
    res.send(200, data, '.html')
  })
})
app.get('/login', function(req, res) { // 登录 GET
  ejs.renderFile('./views/login.ejs', { title: '用户登录'}, (err, data) => {
    res.send(200, data, '.html')
  })
})
app.get('/register', function (req, res) { // 注册 GET
  ejs.renderFile('./views/register.ejs', { title: '用户注册'}, (err, data) => {
    res.send(200, data, '.html')
  })
})
app.post('/api/login', function (req, res) { // 登录 POST
  const str = req.body
  const data = querystring.parse(str)
  const userData = fs.readFileSync(path.join(__dirname, './utils/store.text')) // 读取数据
  const userInfo = querystring.parse(userData.toString());
  if (data.username == userInfo.username && data.password == userInfo.password) {
    res.send(200, `<h1>登录成功</h1><a onclick="javascript:history.back()">返回上一级</a><div>${str}</div>`, '.html')
  } else {
    res.send(200, `<h1>用户名密码错误</h1><a onclick="javascript:history.back()">返回上一级</a><div>${str}</div>`, '.html')
  }
})
app.post('/api/register', function (req, res) { // 注册 POST
  const str = req.body
  util.writeFile(path.join(__dirname, './utils/store.text'), str).then(() => {
    res.send(200, `<h1>注册成功</h1><a onclick="javascript:history.back()">返回上一级</a><div>${str}</div>`, '.html')
  }).catch((error) => {
    console.error(error)
  })
})
// 监听服务
server.listen(3000, console.log('server port 3000'))


