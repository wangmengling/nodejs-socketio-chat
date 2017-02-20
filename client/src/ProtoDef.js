/**
 * Created with JetBrains WebStorm
 * Author:Shawn
 * Contact:txiejun@126.com
 * Date:2016/12/5
 * Time:19:40
 */
//ProtoDef 客户端-协议配置

var ProtoDef = {

};

/**
 * 消息类型定义
 * @type {{}}
 */
ProtoDef.MsgType = {
    // client->server
    Login_CS :1,
    Logout_CS:2,
    Message_CS:3,

    // server->client
    Login_SC:101,
    Logout_SC:102,
    Message_SC:103
};

ProtoDef.MsgMap = {};
ProtoDef.register = function(key, value){
    ProtoDef.MsgMap[key] = value;
};

ProtoDef.init = function(){
    ProtoDef.register(ProtoDef.MsgType.Login_CS, "chat.Login_CS");
    ProtoDef.register(ProtoDef.MsgType.Logout_CS, "chat.Logout_CS");
    ProtoDef.register(ProtoDef.MsgType.Message_CS, "chat.Message_CS");
    ProtoDef.register(ProtoDef.MsgType.Login_SC, "chat.Login_SC");
    ProtoDef.register(ProtoDef.MsgType.Logout_SC, "chat.Logout_SC");
    ProtoDef.register(ProtoDef.MsgType.Message_SC, "chat.Message_SC");
};

ProtoDef.init();

var pbRoot = null;
var pbCtor = {};

/**
 * 加载协议文件并解析
 * @param url
 * @param cb
 */
ProtoDef.loadProto = function(url, cb){
    protobuf.load(url, function(err, root) {
        if (err){
            throw err;
        }
        pbRoot = root;
        if(pbRoot){
            for(var key in ProtoDef.MsgType){
                var id = ProtoDef.MsgType[key];
                var name = ProtoDef.MsgMap[id];
                if(name){
                  console.log(root.lookup(name));
                    pbCtor[id] = root.lookup(name);
                }
            }
        }

        if(cb){
            cb();
        }
    }.bind(this));
};

/**
 * 获得Type
 * @param msg_id
 * @returns {*}
 */
ProtoDef.getType=function(msg_id){
    if(pbCtor){
        return pbCtor[msg_id];
    }
    return null;
};

/**
 * 编码
 * @param msgType 消息类型
 * @param data 数据
 * @return ArrayBuffer
 */
ProtoDef.pack = function(msgType, data){
    var Type = ProtoDef.getType(msgType);
    console.log(Type);
    if(Type){
        var vo = Type.create(data);
        var uint8Array = Type.encode(vo).finish();
        return uint8Array.buffer;
    }
    return null;
};

/**
 * 解码
 * @param msgType
 * @param uint8Array
 * @return vo对象
 */
ProtoDef.unpack = function(msgType, uint8Array){
    var Type = ProtoDef.getType(msgType);
    if(Type){
        if(uint8Array instanceof ArrayBuffer){
            uint8Array = new Uint8Array(uint8Array);
        }
        var vo = Type.decode(uint8Array);
        return vo;
    }
    return null;
};
