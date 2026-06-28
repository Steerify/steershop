/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import { styles } from './shared-styles.ts'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  token: string
}

// TODO: Replace this URL with the URL of the newly uploaded Neon Green 'S' logo
const LOGO_URL = 'https://steersolo.com/email-logo.jpg'

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
  token,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to SteerSolo — verify your email to get started!</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.headerSection}>
          <Img src={LOGO_URL} alt="SteerSolo" style={styles.logo} />
        </Section>
        <Heading style={styles.h1}>Welcome aboard! 🎉</Heading>
        <Text style={styles.text}>
          You're one step away from launching your WhatsApp-powered online store on{' '}
          <Link href={siteUrl} style={styles.link}>
            SteerSolo
          </Link>
          .
        </Text>
        <Text style={styles.mutedText}>
          Please verify your email (
          <Link href={`mailto:${recipient}`} style={styles.link}>
            {recipient}
          </Link>
          ) by clicking the button below:
        </Text>
        <Section style={{ ...styles.codeSection }>
          <Link href={confirmationUrl} style={{
            backgroundColor: '#2563eb', color: 'white', padding: '14px 28px', borderRadius: '28px', textDecoration: 'none', fontSize: '16px', fontWeight: 700, display: 'inline-block'
          }}>
            Verify Your Email
          </Link>
        </Section>
        <Text style={styles.mutedText}>
          Or copy and paste this link into your browser:
        </Text>
        <Text style={styles.codeText}>{confirmationUrl}</Text>
        <Text style={styles.footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
        <Text style={styles.footerBrand}>
          SteerSolo — Launch your online store in minutes 🚀
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
