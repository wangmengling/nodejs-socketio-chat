var fs = require("fs");
var ProtoDef = require("./ProtoDef.js");
ProtoDef.init();
ProtoDef.loadProto("./config/chat.proto");

var express = require('express')
var path = require('path')

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.send('<h1>Welcome Realtime Server</h1>');
});

//在线用户
var onlineUsers = [];
//当前在线人数
var onlineCount = 0;

/**
 * 寻找玩家再数组中的位置
 * @returns {number}
 */
var findUser = function(userid){
	var index = -1;
	if(onlineUsers && userid!=null){
		var len = onlineUsers.length;
		for(var i = 0; i<len;i++){
			if(onlineUsers[i].userid==userid){
				index = i;
				break;
			}
		}
	}
	return index;
};

/**
 * 添加玩家
 * @param user
 */
var addUser = function(user){
	if(onlineUsers && user){
		if(findUser(user.userid)==-1){
			onlineUsers.push(user);
		}
	}
};

/**
 * 删除玩家
 * @param user
 */
var removeUser = function(userid){
	var user = null;
	if(onlineUsers && user){
		var index = findUser(userid);
		if(index!=-1){
			user = onlineUsers[index];
			onlineUsers.splice(index,1);
		}
	}
	return user;
};

//监听客户端连接
io.on('connection', function(socket){
	console.log('a user connected');

	//监听新用户加入
	socket.on('login', function(buffer){
		var obj = ProtoDef.unpack(ProtoDef.MsgType.Login_CS, buffer);

		//将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
		socket.name = obj.user.userid;

		//检查在线列表，如果不在里面就加入
		addUser(obj.user);
		onlineCount = onlineUsers.length;

		//向所有客户端广播用户加入
		// io.emit('login', {onlineUsers:onlineUsers, login_user:obj.user});
		var buffer = ProtoDef.pack(ProtoDef.MsgType.Login_SC, {onlineUsers:onlineUsers, loginuser:obj.user});
		io.emit('login', buffer);
		console.log(obj.user.username+'加入了聊天室');
	});

	//监听用户退出
	socket.on('disconnect', function(){
		//将退出的用户从在线列表中删除
		if(onlineUsers.hasOwnProperty(socket.name)) {
			//退出用户的信息
			var user = removeUser(socket.name);
			if(user){
				onlineCount = onlineUsers.length;

				//向所有客户端广播用户退出
				// io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
				var buffer = ProtoDef.pack(ProtoDef.MsgType.Logout_SC, {onlineUsers:onlineUsers, logoutuser:user});
				io.emit('logout', buffer);
				console.log(user.username+'退出了聊天室');
			}
		}
	});

	//监听用户发布聊天内容
	socket.on('message', function(data){
		var obj = ProtoDef.unpack(ProtoDef.MsgType.Message_CS, data);
		//向所有客户端广播发布的消息
		// io.emit('message', obj);
		// var buffer = ProtoDef.pack(ProtoDef.MsgType.Message_SC, obj);
		console.log(data);
		io.emit('message', data);
		console.log(data.length);
		console.log(obj.user.username+'说：'+obj.content);
	});

});
app.use(express.static(path.join(__dirname, 'config')));
http.listen(3000, function(){
	console.log('listening on *:3000');
});
