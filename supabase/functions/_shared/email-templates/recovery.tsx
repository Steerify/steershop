/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

const LOGO_URL = 'https://hwkcqgmtinbgyjjgcgmp.supabase.co/storage/v1/object/public/email-assets/steersolo-logo.jpg'

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your SteerSolo password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} width="120" height="40" alt="SteerSolo" style={logo} />
        </Section>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your password. Click below to choose a new one.
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Reset Password
          </Button>
        </Section>
        <Text style={footer}>
          If you didn't request this, you can safely ignore this email. Your password won't change.
        </Text>
        <Text style={footerBrand}>
          SteerSolo — Launch your online store in minutes 🚀
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Roboto', 'Inter', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { marginBottom: '24px' }
const logo = { borderRadius: '8px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: 'hsl(220, 45%, 15%)',
  margin: '0 0 16px',
  fontFamily: "'Poppins', Arial, sans-serif",
}
const text = {
  fontSize: '15px',
  color: 'hsl(220, 15%, 45%)',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const buttonSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = {
  backgroundColor: 'hsl(215, 65%, 25%)',
  color: 'hsl(40, 20%, 98%)',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
const footerBrand = { fontSize: '12px', color: 'hsl(220, 15%, 45%)', margin: '8px 0 0', fontStyle: 'italic' as const }
