// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../css/app.css";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import "phoenix_html";

import channel from "./socket";
// import { Socket } from "phoenix";

// channel
//   .join()
//   .receive("ok", (res) => {
//     console.log("Successfully joined call channel");
//   })
//   .receive("error", (res) => {
//     console.log("Unable to join");
//   })
//   .receive("timeout", () => {});

let peerConnection;
let localVideo = document.getElementById("local-stream"); // possibly change this to remote-stream
let remoteVideo = document.getElementById("remote-stream");
let connectButton = document.getElementById("connect");
let callButton = document.getElementById("call");
let disconnectButton = document.getElementById("disconnect");
let remoteStream = new MediaStream();
setVideoStream(remoteVideo, remoteStream);

disconnectButton.disabled = true;
callButton.disabled = true;
connectButton.onclick = connect;
callButton.onclick = call;
disconnectButton.onclick = disconnect;

// document.onmousedown = broadcastMouse;

// function broadcastMouse(e) {
//   pushPeerMessage("mouse-event", { x: e.pageX, y: e.pageY });
// }

function setVideoStream(videoElement, stream) {
  videoElement.srcObject = stream;
}

function unsetVideoStream(videoElement) {
  if (videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach((track) => track.stop());
  }
  videoElement.removeAttribute("src");
  videoElement.removeAttribute("srcObject");
}

async function connect() {
  connectButton.disabled = true;
  disconnectButton.disabled = false;
  callButton.disabled = false;

  const localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  setVideoStream(localVideo, localStream);
  peerConnection = await createPeerConnection(localStream);
}

async function createPeerConnection(stream) {
  debugger;
  let pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.stunprotocol.org" }],
  });

  pc.ontrack = handleOnTrack;
  pc.onicecandidate = handleIceCandidate;
  stream.getTracks().forEach((track) => pc.addTrack(track));
  return pc;
}

async function disconnect() {
  connectButton.disabled = false;
  disconnectButton.disabled = true;
  callButton.disabled = true;
  unsetVideoStream(localVideo);
  unsetVideoStream(remoteVideo);
  remoteStream = new MediaStream();
  setVideoStream(remoteVideo, remoteStream);
  peerConnection.close();
  peerConnection = null;
  pushPeerMessage("disconnect", {});
}

async function call() {
  let offer = await peerConnection.createOffer();
  debugger;
  peerConnection.setLocalDescription(offer);
  pushPeerMessage("video-offer", offer);
}

function pushPeerMessage(type, content) {
  channel.push("peer-message", {
    body: JSON.stringify({
      type,
      content,
    }),
  });
}

async function answerCall(offer) {
  receiveRemote(offer);
  let answer = await peerConnection.createAnswer();
  peerConnection
    .setLocalDescription(answer)
    .then(() =>
      pushPeerMessage("video-answer", peerConnection.localDescription)
    );
}

function receiveRemote(offer) {
  let remoteDescription = new RTCSessionDescription(offer);
  peerConnection.setRemoteDescription(remoteDescription);
}

function handleOnTrack(event) {
  console.log(event);
  remoteStream.addTrack(event.track);
}

function handleIceCandidate(event) {
  if (!!event.candidate) {
    pushPeerMessage("ice-candidate", event.candidate);
  }
}
let canvas = document.getElementById("whiteboard");
let ctx = canvas.getContext("2d");
ctx.scale(1, 1);
canvas.width = 640;
canvas.height = 400;
let flag = false;
let prevX = 0;
let currX = 0;
let prevY = 0;
let currY = 0;
let dot_flag = false;
let x = "black";
let y = 1;

channel.on("peer-message", (payload) => {
  const message = JSON.parse(payload.body);
  switch (message.type) {
    case "video-offer":
      debugger;
      console.log("Offer", message.content);
      answerCall(message.content);
      break;
    case "video-answer":
      console.log("Answer", message.content);
      receiveRemote(message.content);
      break;
    case "MOUSE_DOWN":
      break;
    case "MOUSE_UP":
      break;
    case "draw-event":
      debugger;
      console.log(message.content);
      let { currentX, currentY, previousX, previousY } = message.content;

      draw(message.content);
      break;
    case "ice-candidate":
      debugger;
      console.log("Candidate", message.content);
      let candidate = new RTCIceCandidate(message.content);
      peerConnection.addIceCandidate(candidate).catch((e) => {
        console.error(e);
      });
      break;
    case "disconnect":
      disconnect();
    default:
      console.error(message.content);
  }
});

function pushDrawEvent(drawMessage) {
  debugger;
  pushPeerMessage("draw-event", drawMessage);
}

function pushMouseUp(mouseMessage) {
  pushPeerMessage("REMOTE_MOUSE_UP");
}

// ctx.fillRect(0, 0, 150, 75);
function beginDraw(message) {
  const { x, y } = message;
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function draw(message) {
  let { previousX, previousY, currentX, currentY } = message;
  console.log(message);
  ctx.beginPath();
  ctx.moveTo(previousX, previousY);
  ctx.lineTo(currentX, currentY);
  ctx.strokeStyle = x;
  ctx.lineWidth = y;
  ctx.stroke();
  ctx.closePath();
}
canvas.addEventListener(
  "mousemove",
  function (e) {
    findxy("move", e);
  },
  false
);
canvas.addEventListener(
  "mousedown",
  function (e) {
    findxy("down", e);
  },
  false
);
canvas.addEventListener(
  "mouseup",
  function (e) {
    findxy("up", e);
  },
  false
);
canvas.addEventListener(
  "mouseout",
  function (e) {
    findxy("out", e);
  },
  false
);

function findxy(res, e) {
  if (res == "down") {
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.getBoundingClientRect().left;
    console.log("boundingY: ", canvas.getBoundingClientRect().top);
    console.log("clientY", e.clientY);
    currY = e.clientY - canvas.getBoundingClientRect().top;

    pushPeerMessage("MOUSE_DOWN", { x: currX, y: currY });

    flag = true;
    dot_flag = true;
    if (dot_flag) {
      ctx.beginPath();
      ctx.fillStyle = x;
      ctx.fillRect(currX, currY, 2, 2);
      ctx.closePath();
      dot_flag = false;
    }
  }
  if (res == "up" || res == "out") {
    flag = false;
    pushPeerMessage("MOUSE_UP", {});
  }
  if (res == "move") {
    if (flag) {
      console.log("moving");
      debugger;
      prevX = currX;
      // console.log("Prevx: ", prevX);
      prevY = currY;
      currX = e.clientX - canvas.getBoundingClientRect().left;
      // console.log("CurrX: ", currX);
      currY = e.clientY - canvas.getBoundingClientRect().top;
      draw({
        previousX: prevX,
        previousY: prevY,
        currentX: currX,
        currentY: currY,
      });
      pushDrawEvent({
        previousX: prevX,
        previousY: prevY,
        currentX: currX,
        currentY: currY,
      });
    }
  }
}
