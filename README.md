# Chat App

## Environment Variables

This app supports email sending via Resend and SMTP.

### Resend

Required when using Resend to send OTP emails:

- `RESEND_API_KEY` - your Resend API key
- `RESEND_FROM_EMAIL` - a verified sender email address for your Resend account

Important: Resend requires the `from` address to be verified for sending to recipients outside your own testing email. If you see an error like:

> "You can only send testing emails to your own email address... verify a domain at resend.com/domains"

then verify a domain in Resend and use an email address from that domain as `RESEND_FROM_EMAIL`.

### SMTP

Use SMTP as fallback or instead of Resend:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM` (optional; defaults to `SMTP_USER`)

### Example

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=verified@yourdomain.com

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your_smtp_password
MAIL_FROM=you@example.com
```
