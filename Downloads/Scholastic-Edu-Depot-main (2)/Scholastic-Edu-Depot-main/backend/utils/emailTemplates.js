const getVerificationEmailTemplate = (name, verificationUrl) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Inter', system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            .header { background: linear-gradient(135deg, #2563ea, #1e40af); padding: 40px 0; text-align: center; }
            .logo { width: 80px; height: 80px; background-color: #ffffff; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .logo img { width: 50px; height: auto; }
            .content { padding: 40px; text-align: center; }
            .heading { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
            .text { font-size: 16px; color: #64748b; margin-bottom: 32px; }
            .button { display: inline-block; background-color: #2563ea; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: background-color 0.2s; }
            .button:hover { background-color: #1d4ed8; }
            .footer { background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; }
            .link { color: #2563ea; word-break: break-all; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                     <!-- Replace with your actual logo URL hosted publicly -->
                    <span style="font-size: 24px; font-weight: bold; color: #2563ea;">SED</span>
                </div>
            </div>
            <div class="content">
                <h1 class="heading">Welcome to SED, ${name}!</h1>
                <p class="text">We're thrilled to have you on board. Please verify your email address to access your student dashboard and start your learning journey.</p>
                
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
                
                <p style="margin-top: 32px; font-size: 14px; color: #cbd5e1;">(Link expires in 15 minutes)</p>
            </div>
            <div class="footer">
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <a href="${verificationUrl}" class="link">${verificationUrl}</a>
                <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} Scholastic Edu. Depot. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { getVerificationEmailTemplate };
