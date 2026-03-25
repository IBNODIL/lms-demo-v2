export function getVerificationEmailTemplate(
  verificationCode: string,
  userName?: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 32px;
            margin: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 8px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin: 16px 0;
          }
          .content {
            color: #4b5563;
            margin: 24px 0;
            line-height: 1.8;
          }
          .verification-button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 32px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 24px 0;
          }
          .verification-button:hover {
            background-color: #2563eb;
          }
          .link-text {
            word-break: break-all;
            color: #3b82f6;
            font-size: 12px;
          }
          .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
          .expiry-notice {
            background-color: #fef3c7;
            border-left: 4px solid #fbbf24;
            padding: 12px 16px;
            margin: 16px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">ibnodil LMS</div>
            <div class="title">Verify Your Email</div>
          </div>

          <div class="content">
            <p>Hi${userName ? ' ' + userName : ''},</p>
            
            <p>Thank you for signing up! To complete your registration and unlock all features, please verify your email address using the code below.</p>

            <div style="text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">Your verification code:</p>
              <p style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 5px; margin: 0;">${verificationCode}</p>
            </div>

            <p style="text-align: center; color: #666; font-size: 14px;">Enter this code on the verification page</p>

            <div class="expiry-notice">
              This code will expire in 15 minutes for security reasons.
            </div>

            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>

          <div class="footer">
            <p>© 2026 Antonio LMS. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getWelcomeEmailTemplate(userName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Antonio LMS</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 32px;
            margin: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 8px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin: 16px 0;
          }
          .content {
            color: #4b5563;
            margin: 24px 0;
            line-height: 1.8;
          }
          .cta-button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 32px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 24px 0;
          }
          .cta-button:hover {
            background-color: #2563eb;
          }
          .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Antonio LMS</div>
            <div class="title">Welcome!</div>
          </div>

          <div class="content">
            <p>Hi${userName ? ' ' + userName : ''},</p>
            
            <p>Your email has been verified successfully! You now have full access to Antonio LMS.</p>

            <p>Start learning today and explore our courses designed to help you grow your skills.</p>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="cta-button">Go to Dashboard</a>
            </div>
          </div>

          <div class="footer">
            <p>© 2026 Antonio LMS. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
