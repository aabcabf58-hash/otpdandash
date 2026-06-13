# WhatsApp OTP Authentication API

Express/MongoDB backend for a Flutter authentication flow:

1. Register or log in with an E.164 phone number and password.
2. The server validates credentials and sends a 6-digit code over WhatsApp.
3. The client verifies the code using the returned `challengeId`.
4. Only successful OTP verification returns a JWT.

## Architecture

```text
src/
  config/       environment and MongoDB setup
  controllers/  HTTP request/response handling
  middleware/   authentication, validation, errors
  models/       Mongoose schemas
  routes/       API route definitions
  services/     authentication, OTP, JWT, WhatsApp logic
  utils/        shared helpers
  validators/   Zod request schemas
```

## Local setup

```bash
cp .env.example .env
npm install
npm run dev
```

On Windows PowerShell use `Copy-Item .env.example .env`. Start MongoDB locally or use a MongoDB Atlas connection string. With `WHATSAPP_PROVIDER=console`, OTPs are printed in the server terminal for development.

## API

All phone numbers must use E.164 format, such as `+96170123456`.

### Register

`POST /api/auth/register`

```json
{ "phone": "+96170123456", "password": "StrongPass123" }
```

### Login

`POST /api/auth/login`

```json
{ "phone": "+96170123456", "password": "StrongPass123" }
```

Both endpoints return:

```json
{
  "success": true,
  "message": "OTP sent on WhatsApp.",
  "data": {
    "challengeId": "MongoObjectId",
    "phone": "+96170123456",
    "expiresInSeconds": 300
  }
}
```

### Verify OTP

`POST /api/auth/verify-otp`

```json
{ "challengeId": "MongoObjectId", "code": "123456" }
```

The response contains `data.accessToken`. Store it securely in Flutter and send it as `Authorization: Bearer TOKEN`.

### Current user

`GET /api/auth/me` with a Bearer token.

### Health check

`GET /api/health`

## WhatsApp with Green API

Set `WHATSAPP_PROVIDER=green-api`, then provide `GREEN_API_INSTANCE` and
`GREEN_API_TOKEN`. The instance must be authorized. Phone numbers sent by the
client must use E.164 format, such as `+96181462097`.

## WhatsApp with Twilio

Set `WHATSAPP_PROVIDER=twilio` and provide all three Twilio variables from `.env.example`. During Twilio sandbox testing, each recipient must first join your WhatsApp sandbox. For production, configure an approved WhatsApp sender and follow WhatsApp/Twilio template requirements.

## Deploy to Render

1. Push this backend folder to GitHub.
2. Create a Render Blueprint using `render.yaml`, or create a Node web service manually.
3. Add the MongoDB Atlas URI and Twilio secrets in Render.
4. In MongoDB Atlas, allow network access from Render and create a least-privilege database user.
5. Set `CORS_ORIGINS` to your permitted web origins. Native Flutter apps are not governed by browser CORS, but Flutter Web is.

Never commit `.env`, OTP values, passwords, or provider credentials.
