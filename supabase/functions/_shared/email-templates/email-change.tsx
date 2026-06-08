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
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

import { styles } from './shared-styles.ts'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

// TODO: Replace this URL with the URL of the newly uploaded Neon Green 'S' logo
const LOGO_URL = 'https://steersolo.com/email-logo.jpg'

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change on SteerSolo</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.headerSection}>
          <Img src={LOGO_URL} alt="SteerSolo" style={styles.logo} />
        </Section>
        <Heading style={styles.h1}>Confirm your email change</Heading>
        <Text style={styles.text}>
          You requested to change your email from{' '}
          <Link href={`mailto:${email}`} style={styles.link}>
            {email}
          </Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={styles.link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={confirmationUrl}>
            Confirm Email Change
          </Button>
        </Section>
        <Text style={styles.footer}>
          If you didn't request this change, please secure your account immediately.
        </Text>
        <Text style={styles.footerBrand}>
          SteerSolo — Launch your online store in minutes 🚀
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
