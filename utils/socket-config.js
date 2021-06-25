const socket = require("socket.io")

function importSocketConfig(socket, io){
socket.emit("connected");

  socket.on("user-connection", data => {

    io.emit("userConnection", {
      message:
        "Yeni birisi söhbətə daxil oldu! Adı : " + data.split("@").shift(),
      username: data
    });
  });


  socket.on("message", obj => {
    let name = obj.name;
    let message = obj.message;

    socket.broadcast.emit("message", { name: name, message: message });
  });

  socket.on("duyuru", duyuruData => {
    io.emit("duyuru", duyuruData);
  });
}

module.exports = {
  importSocketConfig
}