var crypto = require('crypto');
module.exports = function(psw) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(psw).digest('base64');
	return password;
}