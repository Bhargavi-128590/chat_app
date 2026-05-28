socket.on("join_chat", (chatId) => {
  socket.join(chatId);

  console.log("Joined Chat:", chatId);
});