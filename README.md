# Chat App

## Environment Variables

This app sends OTP emails via Resend.

### Resend

Required for OTP delivery:

- `RESEND_API_KEY` - your Resend API key

If your Resend account is restricted to verified sender addresses, make sure the sender address you use is verified in Resend.

### Example

```env
RESEND_API_KEY=your_resend_api_key
```
