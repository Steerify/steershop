/// <reference types="npm:@types/react" />

import * as React from 'react'

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
} from '@react-email/components'

import { styles } from './shared-styles.ts'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

// TODO: Replace this URL with the URL of the newly uploaded Neon Green 'S' logo
const LOGO_URL = 'https://steersolo.com/email-logo.jpg'

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your SteerSolo password</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.headerSection}>
          <Img src={LOGO_URL} alt="SteerSolo" style={styles.logo} />
        </Section>
        <Heading style={styles.h1}>Reset your password</Heading>
        <Text style={styles.text}>
          We received a request to reset your password. Click below to choose a new one.
        </Text>
        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={confirmationUrl}>
            Reset Password
          </Button>
        </Section>
        <Text style={styles.footer}>
          If you didn't request this, you can safely ignore this email. Your password won't change.
        </Text>
        <Text style={styles.footerBrand}>
          SteerSolo — Launch your online store in minutes 🚀
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
