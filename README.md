# nsp-chat
This is a simple chat demo by using Node.js, Socket.IO and protobuf.js.

This project is based on the project:

https://github.com/plhwin/nodejs-socketio-chat

http://www.plhwin.com/2014/05/28/nodejs-socketio/

#Hint
When use the protobuf.js,I meet some problem.Such as:  
```JavaScript
message AwesomeMessage {
    string awesome_field = 1; // becomes awesomeField
}
```

the field `awesome_field` will becomes `awesomeField`.

