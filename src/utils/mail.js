import Mailgen from "mailgen"
import nodemailer from "nodemailer"

const sendEmail = async (options) => {
    const mailGenerator =  new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "http://taskmanagerlink.com"
        }
    })

    const emailText = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtml = mailGenerator.generate(options.mailgenContent)

    const transporter =  nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail = {
        from: "knirmalnethra@gmail.com",
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHtml
    }

    try
    {
        await transporter.sendMail(mail)
    }
    catch (error)
    {
        console.error("Email service has fail,Make sure you provided correct info")
        console.error("Error: ",error)
    }

}

const emailVerificationMailGenContent = (username, verificationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our app: we are excited to have on our board",
            action: {
                instructions: "To verify your mail please click on the following botton",
                button: {
                    color: "#22BC66",
                    text: "Confirm your account",
                    link: verificationURL
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}

const emailResetMailGenContent = (username, resetURL) => {
    return {
        body: {
            name: username,
            intro: "We got request to reset the password of your account",
            action: {
                instructions: "To reset your password please click the following button",
                button: {
                    color: "#22BC66",
                    text: "reset password",
                    link: resetURL
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}

export {
    emailVerificationMailGenContent,
    emailResetMailGenContent,
    sendEmail
}