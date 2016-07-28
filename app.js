var express = require('express');
var app = express();
var router = require('./router/router.js');
var session = require('express-session');

app.use(session({
	secret: 'xqt',
	resave: false,
	saveUninitialized: true,
}));


//设置模版引擎
app.set('view engine', 'ejs');

//静态化
app.use(express.static('./public'));
app.use('/avatar', express.static('./avatar'));
//路由
app.get('/', router.showIndex);
app.get('/register', router.showRegister);
app.get('/login', router.showLogin);
app.get('/usercenter', router.showUserCenter);
app.post('/doRegister', router.doRegister);
app.post('/doLogin', router.doLogin);
app.post('/upAvatar', router.doUp);
app.get('/cut',function(req,res){
	res.render('cut');
});
app.get('/doCut', router.doCut);
app.listen(3000);