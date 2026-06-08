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

import { styles } from './shared-styles.ts'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

// TODO: Replace this URL with the URL of the newly uploaded Neon Green 'S' logo
const LOGO_URL = 'https://steersolo.com/email-logo.jpg'

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your SteerSolo login link</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.headerSection}>
          <Img src={LOGO_URL} alt="SteerSolo" style={styles.logo} />
        </Section>
        <Heading style={styles.h1}>Your magic login link ✨</Heading>
        <Text style={styles.text}>
          Click the button below to log in to SteerSolo instantly — no password needed. This link expires shortly.
        </Text>
        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={confirmationUrl}>
            Log In to SteerSolo
          </Button>
        </Section>
        <Text style={styles.footer}>
          If you didn't request this link, you can safely ignore this email.
        </Text>
        <Text style={styles.footerBrand}>
          SteerSolo — Launch your online store in minutes 🚀
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
