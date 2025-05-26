/* jshint browser: true */
/* jshint indent: 2 */
const host = "61.241.63.126";
// const host = "127.0.0.1";
const port = "5000";
const prefix = "/api";
// const prefix = "";
const endpoint = "http://" + host + ":" + port + prefix;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function contact(fname, lname, email, message, post_fn) {
  const post = "/contact";
  var data = {
    "fname": fname,
    "lname": lname,
    "email": email,
    "message": message
  }
  let request = fetch(endpoint + post, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // "Origin": "http://gensi-thuair.com",
    },
    body: JSON.stringify(data)
  })
  request.then(response => {
    response.json().then(data => {
      console.log(data);
      alert(data.message);
      post_fn();
    })
  }).catch(error => {
    console.error(error);
    alert("Contact is not available for now. Please click the email link instead.");
  })
}

function submitButtonToggle() {
  const act_btn = document.getElementById("contact-subtn");
  const dis_btn = document.getElementById("contact-disable");
  // toggle class `none`
  act_btn.classList.toggle("none");
  dis_btn.classList.toggle("none");
}

function submitContact() {
  const fname = document.getElementById("contact-fname").value;
  const lname = document.getElementById("contact-lname").value;
  const email = document.getElementById("contact-email").value;
  const message = document.getElementById("contact-message").value;
  if (emailRegex.test(email) == false) {
    alert("Please enter a valid email address.");
    return;
  }
  if (message.length == 0) {
    alert("Empty message is not allowed.");
    return;
  }
  submitButtonToggle();
  contact(fname, lname, email, message, submitButtonToggle);
}