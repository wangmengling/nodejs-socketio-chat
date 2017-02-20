/**
 * Created with JetBrains WebStorm
 * Author:Shawn
 * Contact:txiejun@126.com
 * Date:2016/12/5
 * Time:14:27
 */

/**
 * socket客户端
 * @constructor
 */
var SocketClient = function(){
    this.socket = null;
    this.url = "";

};

SocketClient.prototype.connect = function(url) {
    console.log("connect:"+url);
    this.socket = io.connect(url);
    this.socket.on("open", this.onOpen.bind(this));
    this.socket.on("error", this.onError.bind(this));
    this.socket.on("data", this.onMessage.bind(this));
};

/**
 * 关闭连接
 */
SocketClient.prototype.disconnect = function() {
    if(this.socket){
        console.log("disconnect");
        this.socket.close();
        this.socket = null;
        this.url = "";
    }
};

/**
 * 注册消息处理函数
 * @param cmd
 * @param handler
 * @param thisObj
 */
SocketClient.prototype.addSocketListener = function(cmd, handler, thisObj){
    this.socket.on(cmd, function(data){

        if(handler!=null){

        }
    });
};

/**
 * 删除消息处理监听
 * @param command
 * @param handler
 * @param thisObj
 */
SocketClient.prototype.removeSocketListener = function(command, handler, thisObj){
    this.socket.off();
};

SocketClient.prototype.onOpen = function(data){
    console.log("onopen data:"+data);
};

SocketClient.prototype.onError = function(data){
    console.log("onError data:"+data);
};

SocketClient.prototype.sendMessage = function(cmd, data){
    console.log("sendMessage data:"+data);
};

SocketClient.prototype.onMessage = function(data){
    console.log("onMessage data:"+data);
};

var socketClient = new SocketClient();