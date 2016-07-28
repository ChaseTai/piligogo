var db = require("../models/db.js");
var md5 = require("../models/md5.js");
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var gm = require('gm');



//主页渲染
exports.showIndex = function(req, res, next) {
	if (req.session.login == 1) {
		db.find('userinfo', {
			"username": req.session.username
		}, function(err, result) {
			var avatar = result[0].avatar;
			console.log(avatar)
			res.render('index', {
				"login": req.session.login == 1 ? true : false,
				"username": req.session.login == 1 ? req.session.username : false,
				"active": "index",
				"avatar": avatar
			});
		});
	} else {
		res.render('index', {
			"login": req.session.login == 1 ? true : false,
			"username": req.session.login == 1 ? req.session.username : false,
			"active": "index",
			"avatar": "default.jpg"
		});
	}
}


//注册页渲染
exports.showRegister = function(req, res, next) {
	res.render('register', {
		"login": req.session.login == 1 ? true : false,
		"username": req.session.login == 1 ? req.session.username : false,
		"active": "register"
	});
}


//登录页渲染
exports.showLogin = function(req, res, next) {
	res.render('login', {
		"login": req.session.login == 1 ? true : false,
		"username": req.session.login == 1 ? req.session.username : false,
		"active": "login"
	});
}


//注册业务处理
exports.doRegister = function(req, res, next) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields) {

		var username = fields.username;
		var password = fields.password;
		//密码加密
		password = md5(password);
		console.log(md5(password));

		db.find('userinfo', {
			"username": username
		}, function(err, result) {
			if (result.length === 0) {
				//写入数据库
				db.insertOne("userinfo", {
					"username": username,
					"password": password,
					"avatar": "default.jpg"
				}, function(err, result) {
					if (err) {
						res.json(-1); //数据库错误
						return;
					} else {
						req.session.login = 1;
						req.session.username = username;
						res.json(1); //可以注册
					}
				});
			} else {
				res.json(0); //用户名已存在
			}
		});
	});
}

//登陆业务处理
exports.doLogin = function(req, res, next) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields) {

		var username = fields.username;
		var password = fields.password;
		//密码加密
		password = md5(password);
		console.log(md5(password));

		db.find('userinfo', {
			"username": username
		}, function(err, result) {
			if (result.length === 0) {
				res.json(0); //用户名不存在
			} else if (result[0].password !== password) {
				res.json(-1); //密码不匹配
			} else {
				req.session.login = 1;
				req.session.username = username;
				res.json(1); //登陆成功
			}
		});
	});
}


//个人中心页渲染
exports.showUserCenter = function(req, res, next) {
	if(req.session.login){
		res.render('usercenter',{"login":true,
		"username":req.session.username,"active":"center"});
	}else{
		res.send("请先登录!");
	}
}

//上传头像
exports.doUp = function(req, res, next) {
	var form = new formidable.IncomingForm();
	form.uploadDir = path.normalize(__dirname + "/../avatar/");
	form.parse(req, function(err, fields, files, next) {
		console.log(files);
		if (err) {
			next();
			return;
		}
		var extname = path.extname(files.pic.name);
		var oldpath = files.pic.path;
		var newpath = path.normalize(__dirname + "/../avatar/"+ req.session.username + extname);


		fs.rename(oldpath, newpath, function(err) {
			if (err) {
				res.send('改名失败!');
			}
			res.render('cut',{"avatar":req.session.username});
		});
	});
}


//裁剪头像
exports.doCut = function(req, res, next) {
	var w = req.query.w;
	var h = req.query.h;
	var x = req.query.x;
	var y = req.query.y;
	console.log(w,h,x,y,req.session.username);
	gm('../avatar/'+req.session.username+'.jpg')
	.crop(w, h, x, y)
	.resize(100, 100, '!')
	.write('../avatar/'+req.session.username+'.jpg', function (err) {
	  if (!err){
	  	db.updateMany('userinfo',{"username":req.session.username},{$set:{"avatar":req.session.username+'.jpg'}},function(err,result){
	  		res.json(1);
	  	});
	  }
	});
}