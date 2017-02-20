(function () {
	var d = document,
	w = window,
	p = parseInt,
	dd = d.documentElement,
	db = d.body,
	dc = d.compatMode == 'CSS1Compat',
	dx = dc ? dd: db,
	ec = encodeURIComponent;

	w.CHAT = {
		msgObj:d.getElementById("message"),
		screenheight:w.innerHeight ? w.innerHeight : dx.clientHeight,
		username:null,
		userid:null,
		socket:null,
		//让浏览器滚动条保持在最低部
		scrollToBottom:function(){
			w.scrollTo(0, this.msgObj.clientHeight);
		},
		//退出，本例只是一个简单的刷新
		logout:function(){
			//this.socket.disconnect();
			location.reload();
		},
		//提交聊天消息内容
		submit:function(){
			var content = d.getElementById("content").value;
			if(content != ''){
				var obj = {
					user:{
						userid: this.userid,
						username: this.username
					},
					content: content,
					channelId:1		//对应chat.proto 里面的字段channel_id
				};
				var buffer = ProtoDef.pack(ProtoDef.MsgType.Message_CS, obj);
				this.socket.emit('message', buffer);
				d.getElementById("content").value = '';
			}
			return false;
		},
		genUid:function(){
			return new Date().getTime()+""+Math.floor(Math.random()*899+100);
		},
		//更新系统消息，本例中在用户加入、退出的时候调用
		updateSysMsg:function(o, action){
			//当前在线用户列表
			var onlineUsers = o.onlineUsers;
			//当前在线人数
			var onlineCount = onlineUsers.length;
			//新加入或者退出的用户信息
			var user = (action == 'login') ?o.loginuser:o.logoutuser;

			//更新在线人数
			var userhtml = '';
			var separator = '';
			for(var key in onlineUsers) {
				if(onlineUsers[key]){
					userhtml += separator+onlineUsers[key].username;
					separator = '、';
				}
		    }
			d.getElementById("onlinecount").innerHTML = '当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml;

			//添加系统消息
			var html = '';
			html += '<div class="msg-system">';
			html += user.username;
			html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室';
			html += '</div>';
			var section = d.createElement('section');
			section.className = 'system J-mjrlinkWrap J-cutMsg';
			section.innerHTML = html;
			this.msgObj.appendChild(section);
			this.scrollToBottom();
		},
		//第一个界面用户提交用户名
		usernameSubmit:function(){
			var username = d.getElementById("username").value;
			if(username != ""){
				d.getElementById("username").value = '';
				d.getElementById("loginbox").style.display = 'none';
				d.getElementById("chatbox").style.display = 'block';

				//====start======
				ProtoDef.loadProto("http://localhost:3000/chat.proto", function() {
					this.init(username);
				}.bind(this));
			}
			return false;
		},
		init:function(username){
			/*
			客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
			实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
			*/
			this.userid = this.genUid();
			this.username = username;

			d.getElementById("showusername").innerHTML = this.username;
			//this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + "px";
			this.scrollToBottom();

			//连接websocket后端服务器
			this.socket = io.connect('ws://127.0.0.1:3000');

			//告诉服务器端有用户登录
			var buffer = ProtoDef.pack(ProtoDef.MsgType.Login_CS, {user:{userid:this.userid, username:this.username}});
			this.socket.emit('login', buffer);

			//监听新用户登录
			this.socket.on('login', function(buffer){
				var obj = ProtoDef.unpack(ProtoDef.MsgType.Login_SC, buffer);
				CHAT.updateSysMsg(obj, 'login');
			});

			//监听用户退出
			this.socket.on('logout', function(buffer){
				var obj = ProtoDef.unpack(ProtoDef.MsgType.Logout_SC, buffer);
				CHAT.updateSysMsg(obj, 'logout');
			});

			//监听消息发送
			this.socket.on('message', function(buffer){
				var obj = ProtoDef.unpack(ProtoDef.MsgType.Message_SC, buffer);

				var isme = (obj.user.userid == CHAT.userid) ? true : false;
				var contentDiv = '<div>'+obj.content+'</div>';
				var usernameDiv = '<span>'+obj.user.username+'</span>';

				var section = d.createElement('section');
				if(isme){
					section.className = 'user';
					section.innerHTML = contentDiv + usernameDiv;
				} else {
					section.className = 'service';
					section.innerHTML = usernameDiv + contentDiv;
				}
				CHAT.msgObj.appendChild(section);
				CHAT.scrollToBottom();
			});

		}
	};
	//通过“回车”提交用户名
	d.getElementById("username").onkeydown = function(e) {
		e = e || event;
		if (e.keyCode === 13) {
			CHAT.usernameSubmit();
		}
	};
	//通过“回车”提交信息
	d.getElementById("content").onkeydown = function(e) {
		e = e || event;
		if (e.keyCode === 13) {
			CHAT.submit();
		}
	};
})();
