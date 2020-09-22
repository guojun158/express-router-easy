// 系统模块
const url = require('url')
const path = require('path')
// 自定义模块
const util = require('../utils');

/**
 * Response响应输出
 * @param {Object} res - Response 对象
 */
function sendWrite(res) {
  /**
   * 发送
   * @param {number} code - 状态码
   * @param {string} data - 显示数据
   * @param {string} type - 后缀文件类型
   */
  res.send = async (code, data, type) => {
    res.writeHead(code, {
      'Content-Type': `${await util.getMime(type)};charset=utf-8;`
    })
    res.end(data)
  }
}
/**
 * 
 * @param {Object} req - Request 对象
 * @param {Object} res - Response 对象 
 * @param {string} staticPath - 静态文件目录 
 */
function initStatic(req, res, staticPath) {
  const { pathname } = url.parse(req.url)
  const _path = staticPath + pathname;
  const extname = path.extname(pathname);
  const promise = util.readFile(_path)
  promise.then((data) => {
    res.send(200, data, extname)
  }).catch((error) => {
    res.send(404, `<h1>404</h1><p>${error}</p>`, extname)
  })
}
/**
 * 路由核心对象
 */
const route = () => {
  // 路由全局对象
  const G = {
    _get: {}, // 为了区分get和post同名，所以分开
    _post: {},
    staticPath: './public',
  } 

  const app = function (req, res) {
    // 扩展res的send方法
    sendWrite(res)

    const _url = req.url;
    const _method = req.method.toLowerCase();
    const { pathname, query } = url.parse(_url, true);
    const g = G['_' + _method][pathname];

    if (g) {
      if (_method === 'get') {
        g(req, res);
      } else if (_method === 'post') {
        let result = '';
        req.on('data', (chunk) => result += chunk);
        req.on('end', () => {
          req.body = result;
          g(req, res); // 执行方法
        })
        req.on('error', (e) => {
          console.error(e.message);
        })
      } else {
        res.send(404, '<h1>404页面不存在</h1>', '.html')
      }
    } else {
      // 配置静态web服务
      initStatic(req, res, G.staticPath)
    }
  }
  app.get = function(str, callback) {
    // 注册get方法
    G._get[str] = callback;
  }
  app.post = function(str, callback) {
    // 注册post方法
    G._post[str] = callback;
  }
  // 静态资源web服务目录
  app.static = function(staticPath) {
    G.staticPath = staticPath
  }
  return app;
}

module.exports = route();


