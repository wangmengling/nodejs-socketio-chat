/**
 * Created with JetBrains WebStorm
 * Author:Shawn
 * Contact:txiejun@126.com
 * Date:2016/12/5
 * Time:19:40
 */
//ProtoDef 服务端-协议配置
var exports = module.exports;
var fs = require("fs");
var protobuf = require("protobufjs");

/**
 * 消息类型定义
 * @type {{}}
 */
exports.MsgType = Object.freeze({
    // client->server
    Login_CS :1,
    Logout_CS:2,
    Message_CS:3,

    // server->client
    Login_SC:101,
    Logout_SC:102,
    Message_SC:103
});

var MsgMap = {};
exports.register = function(key, value){
    MsgMap[key] = value;
};

exports.init = function(){
    exports.register(exports.MsgType.Login_CS, "chat.Login_CS");
    exports.register(exports.MsgType.Logout_CS, "chat.Logout_CS");
    exports.register(exports.MsgType.Message_CS, "chat.Message_CS");
    exports.register(exports.MsgType.Login_SC, "chat.Login_SC");
    exports.register(exports.MsgType.Logout_SC, "chat.Logout_SC");
    exports.register(exports.MsgType.Message_SC, "chat.Message_SC");
};

var pbRoot = null;
var pbCtor = {};

/**
 * 加载协议文件并解析
 * @param url
 * @param cb
 */
exports.loadProto = function(url){
    var protoStr = fs.readFileSync(url).toString();
    var pbObj = protobuf.parse(protoStr);
    pbRoot = pbObj.root;
    if(pbRoot){
        for(var key in exports.MsgType){
            var id = exports.MsgType[key];
            var name = MsgMap[id];
            if(name){
                pbCtor[id] = pbRoot.lookup(name);
            }
        }
    }
};

/**
 * 获得Type
 * @param msg_id
 * @returns {*}
 */
exports.getType=function(msg_id){
    if(pbCtor){
        return pbCtor[msg_id];
    }
    return null;
};

/**
 * 编码
 * @param msgType 消息类型
 * @param data 数据
 * @return uint8Array
 */
exports.pack = function(msgType, data){
    var Type = exports.getType(msgType);
    if(Type){
        var vo = Type.create(data);
        var uint8Array = Type.encode(vo).finish();
        return uint8Array;
    }
    return null;
};

/**
 * 解码
 * @param msgType
 * @param uint8Array
 * @return vo对象
 */
exports.unpack = function(msgType, uint8Array){
    var Type = exports.getType(msgType);
    if(Type){
        if(uint8Array instanceof ArrayBuffer){
            uint8Array = new Uint8Array(uint8Array);
        }
        var vo = Type.decode(uint8Array);
        return vo;
    }
    return null;
};
