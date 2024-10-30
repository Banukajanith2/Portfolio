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
                    title: "Message Sent!",
                    text: "Thanks for contacting me! I'll respond ASAP.",
                    icon: "success",
                    showClass: {
                        popup: 'animate__animated animate__fadeInDown animate__faster'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOutUp animate__faster'
                    },
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        content: 'swal2-content',
                        confirmButton: 'swal2-confirm'
                    }
                });
            }
        }
    );
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const showError = (text) => {
        Swal.fire({
            title: "ERROR",
            text: text,
            icon: "error",
            showClass: {
                popup: 'animate__animated animate__fadeInDown animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp animate__faster'
            },
            customClass: {
                popup: 'swal2-popup',
                title: 'swal2-title',
                content: 'swal2-content',
                confirmButton: 'swal2-confirm'
            }
        });
    }

    if (name.value.trim() === "") {
        showError("Name is Empty!");
    } else if (email.value.trim() === "") {
        showError("Email is Empty!");
    } else if (subject.value.trim() === "") {
        showError("Subject is Empty!");
    } else if (message.value.trim() === "") {
        showError("Message is Empty!");
    } else {
        // Check if the email is in a valid format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value)) {
            showError("Please enter a valid email address!");
        } else {
            sendEmail();
        }
    }
});

