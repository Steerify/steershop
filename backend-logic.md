# Google Authentication with Role Selection Backend Logic

## Overview
This document outlines the backend logic required to support the new Google signup flow where a user selected their role (Entrepreneur or Customer) on the frontend.

## Endpoint
`POST /api/v1/auth/google`

## Payload
```json
{
  "idToken": "google_id_token_string",
  "role": "ENTREPRENEUR" // or "CUSTOMER" (Optional for existing users, required for new)
}
```

## Logic Flow (Pseudo-code)

```typescript
async function googleAuth(req, res) {
  const { idToken, role } = req.body;

  // 1. Verify Google Token
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const googleId = payload['sub'];
  const email = payload['email'];

  // 2. Find User
  let user = await prisma.user.findFirst({
    where: { 
      OR: [
        { googleId: googleId },
        { email: email }
      ]
    }
  });

  // 3. Handle Existing User
  if (user) {
    // If user exists but has no role (edge case) or we want to allow role update on first login methods
    // For this flow, we strictly only set role if it's missing or if business logic allows switching.
    // Assuming role is immutable after set, check if it needs setting.
    
    if (!user.role && role) {
       user = await prisma.user.update({
         where: { id: user.id },
         data: { role: role }
       });
    } else if (user.role && role && user.role !== role) {
        // Optional: Warn or handle role mismatch. For now, login as existing role.
    }
    
    // Check if googleId is linked, if not, link it (e.g. existing email user using Google for first time)
    if (!user.googleId) {
       user = await prisma.user.update({
         where: { id: user.id },
         data: { googleId: googleId }
       });
    }

    return generateAndSendTokens(user, res);
  }

  // 4. Handle New User
  if (!user) {
    if (!role) {
      // If role is missing for new user, we could either:
      // A) Return an error telling frontend to ask for role (Safe "Check First" approach)
      // B) Default to CUSTOMER (Not requested)
      // C) Error out (Current frontend flow ensures role is sent)
      return res.status(400).json({ message: "Role is required for new registration" });
    }

    // Create User
    user = await prisma.user.create({
      data: {
        email: email,
        googleId: googleId,
        firstName: payload['given_name'],
        lastName: payload['family_name'],
        role: role,
        isEmailVerified: true, // Google emails are verified
        provider: 'google',
        onboardingCompleted: role === 'CUSTOMER' // Auto-complete for customers, false for Entrepreneurs
      }
    });

    return generateAndSendTokens(user, res);
  }
}
```

# Entrepreneur Onboarding Logic

## Endpoint
`POST /api/v1/onboarding`

## Payload
```json
{
  "businessType": "Fashion / Clothing",
  "customerSource": "WhatsApp",
  "biggestStruggle": "Losing orders",
  "paymentMethod": "Bank transfer only",
  "perfectFeature": "Integration with X"
}
```

## Logic
1.  **Authenticate Request**: Ensure user is logged in.
2.  **Validate Role**: Ensure user is `ENTREPRENEUR`.
3.  **Save Data**: Save questionnaire responses to a new table (e.g., `OnboardingResponse` or `UserProfile`).
4.  **Update User**: Set `onboardingCompleted = true` in the `User` table.
5.  **Return Success**: Return 200 OK.
