var app = require('express').createServer(),
    io = require('socket.io').listen(app),
    sockDict = new Array();
    adminSocket = null;

app.listen(8081);

io.sockets.on('connection',function(socket){

  socket.on('signIn',function(data,fn){

    if(process.argv.length <= 2){
      fn(false,'Not enough startup arguments when starting the server app');
      return;
    }

    for(sock in sockDict){
      var name = sockDict[sock];
      if(name == data.userName){
        fn(false,"Username taken!");
        return;
      }
    }

    sockDict[socket.id] = data.userName;
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
    if(sockDict == null) return;
    socket.broadcast.emit('reset',{ 'userName' : sockDict[socket.id] });
  });

  socket.on('disconnect',function(){
    console.log('disconnect');
    if(adminSocket != null && socket == adminSocket){
      console.log('admin disconnected');
      adminSocket = null;
    }else{
      adminSocket.emit('clientDisconnect', {userName : sockDict[socket.id] });
    }
    sockDict[socket.id] = null;

  });

});

