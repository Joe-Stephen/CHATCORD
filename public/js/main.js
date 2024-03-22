const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

//get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

//join room
socket.emit("joinRoom", { username, room });

//get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outPutUsers(users);
});

//message from server
socket.on("message", (message) => {
  console.log("New message received :", message);
  outputMessage(message);

  //adjusting scroll-position
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
//message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //get the message text
  let msg = e.target.elements.msg.value;
  msg = msg.trim();
  if (!msg) {
    return false;
  }
  //emitting the message to server
  socket.emit("chatMessage", msg);
  //clear input field
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

//users list ro DOM
function outPutUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}
