# Chat App

## Environment Variables

This app sends OTP emails via Resend only.

### Resend

Required for OTP delivery:

- `RESEND_API_KEY` - your Resend API key
- `RESEND_FROM_EMAIL` - a verified sender email address for your Resend account

Important: Resend requires the `from` address to be verified for sending to recipients outside your own testing email. If you see an error like:

> "You can only send testing emails to your own email address... verify a domain at resend.com/domains"

then verify a domain in Resend and use an email address from that domain as `RESEND_FROM_EMAIL`.

### Example

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=verified@yourdomain.com
```
