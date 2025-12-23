
  let actualSpeed = 0;
  let actualRpm = 0;
  const socket = new EventTarget();
  socket.addEventListener("speedUpdate", e => {
  actualSpeed = e.detail
});
socket.addEventListener("rpmUpdate", e => {
  actualRpm = e.detail
});
console.log(`browser speed is ${actualSpeed}, browser rmp is ${actualRpm}`)

