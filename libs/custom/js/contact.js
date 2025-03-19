/* jshint browser: true */
/* jshint indent: 2 */
const host = "127.0.0.1";
const port = "5002";
const endpoint = "http://" + host + ":" + port;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function contact(fname, lname, email, message) {
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
      "Origin": "http://gensi-thuair.com",
    },
    body: JSON.stringify(data)
  })
  request.then(response => {
    if (response.ok) {
      alert("Thank you for your message!");
    } else {
      alert("Error sending message. Please try again.");
    }
  })

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
  contact(fname, lname, email, message);
}