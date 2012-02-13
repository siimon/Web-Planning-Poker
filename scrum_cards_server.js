var app = require('express').createServer(),
    io = require('socket.io').listen(app),
    sockDict = {},
    adminSocket = null;

app.listen(8081);

io.sockets.on('connection',function(socket){

  socket.on('signIn',function(data,fn){
    socket.broadcast.emit('reset');
    sockDict[socket] = data.userName;
    if(process.argv.length <= 2){
      fn(false,'Not enough startup arguments when starting the server app');
      return;
    }
    if(data.userName == process.argv[2]){
      adminSocket = socket;
    }else{
      if(adminSocket != null){
        adminSocket.emit('userSignedIn',{ 'userName' : data.userName});
      }
    }
    if(adminSocket == null){
      fn(false,'No server started, try again later');
    }
    fn(true,null);
  });

  socket.on('vote',function(data){
    console.log('voting from client');
    console.log(data);
    adminSocket.emit('voteOccured', data);
  });

  socket.on('resetCmd',function(){
    console.log('resetCmd');
    socket.broadcast.emit('reset');
  });

  socket.on('disconnect',function(){
    console.log('disconnect');
    if(sockDict[socket] != null){
      adminSocket.emit('clientDisconnect', {userName : sockDict[socket] });
    }
    sockDict[socket] = null;
    if(socket == adminSocket){
      console.log('admin disconnected');
      adminSocket = null;
    }
  });

});

