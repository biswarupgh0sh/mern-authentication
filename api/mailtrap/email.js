import { sender, mailtrapClient } from "../mailtrap/mailtrap.config.js";
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplate.js";
import "dotenv/config";

export const sendVerificationEmail = async (email, verifiationToken) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email with us",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verifiationToken),
            category: "Email Verification"
        })

        console.log("Email sent successfully", response);        
    } catch (error) {
        console.log("Error occurred: ", error);
        throw new Error(`Error sending new email: ${error}`)
    }
}

export const sendWelcomeEmail = async (email, name) =>{
    const recipient = [{ email }]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: process.env.MAILTRAP_WELCOME_AFTER_AUTH_UUID,
            template_variables: {
          "company_info_name": "Auth Company",
          "name": name
        }
        })
    } catch (error) {
      console.log("Error while sending welcome email", error);
      throw new Error("Error sending welcome email", error);
    }

    
}

export const resetPasswordEmail = async (email, resetUrl)=>{
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetUrl}", resetUrl),
            category: "Password Reset"
        })
    } catch (error) {
        console.log("Error sending reset password email", error);
    }
}

export const sendResetSuccessEmail = async (email) => {
    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "password reset successfull",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        })
    } catch (error) {
        console.log("Error sending success password resetting", error);
    }
}