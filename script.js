const form = document.getElementById("contact-form");
const name = document.getElementById("inputName");
const email = document.getElementById("inputEmail");
const subject = document.getElementById("inputSubject");
const message = document.getElementById("inputMessage");

function sendEmail() {
    const bodyMessage = `Full Name: ${name.value} <br> Email: ${email.value} <br> Message: ${message.value}`;

    Email.send({
        Host: "smtp.elasticemail.com",
        Username: "gb198450@gmail.com",
        Password: "7E31C78413E0CF328FEB58111D1C918CC0E0",
        To: "gb198450@gmail.com",
        From: "gb198450@gmail.com",
        Subject: subject.value,
        Body: bodyMessage
    }).then(
        message => {

            if (message == "OK") {

                Swal.fire({
                    title: "Message Sent !",
                    text: "Thanks for contacting me! I'll respond ASAP.",
                    icon: "success"
                });
            }

        }
        
    );
}


form.addEventListener("submit", (e) => {
    e.preventDefault();


    sendEmail();
});
