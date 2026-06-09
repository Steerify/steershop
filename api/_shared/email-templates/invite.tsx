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
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import { styles } from './shared-styles.ts'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

// TODO: Replace this URL with the URL of the newly uploaded Neon Green 'S' logo
const LOGO_URL = 'https://steersolo.com/email-logo.jpg'

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join SteerSolo!</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.headerSection}>
          <Img src={LOGO_URL} alt="SteerSolo" style={styles.logo} />
        </Section>
        <Heading style={styles.h1}>You've been invited! 🎉</Heading>
        <Text style={styles.text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={styles.link}>
            SteerSolo
          </Link>
          . Click below to accept and create your account.
        </Text>
        <Section style={styles.buttonSection}>
          <Button style={styles.button} href={confirmationUrl}>
            Accept Invitation
          </Button>
        </Section>
        <Text style={styles.footer}>
          If you weren't expecting this invitation, you can safely ignore this email.
        </Text>
        <Text style={styles.footerBrand}>
          SteerSolo — Launch your online store in minutes 🚀
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
