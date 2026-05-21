# Auth Incident Runbooks

Date: 2026-05-21

Use these runbooks when collecting evidence for `monitoring-alerting-incident-response`, `security-review-signoff`, `kms-key-custody`, and `production-env-inventory`.

Each drill should record the incident owner, environment, timeline, commands or dashboard actions used, customer communication, rollback decision, and follow-up work. Do not paste secrets, tokens, cookies, OTPs, private keys, or raw provider credentials into the evidence record.

## Signing Key Compromise

1. Declare a high-severity auth incident and assign platform-security as incident owner.
2. Disable new token issuance with the compromised key.
3. Promote fresh signing key material through the configured KMS/HSM or external key provider.
4. Keep only the minimum previous-key overlap required to verify still-valid tokens, or revoke immediately if the key is confirmed exposed.
5. Revoke affected session families and force re-auth for impacted projects or globally.
6. Verify consumers reject tokens with revoked `jti`, stale `token_version`, wrong `aud`, or compromised key ID.
7. Publish customer communication when user sessions or integrations are affected.
8. Attach KMS access logs, revocation evidence, smoke test output, and timeline to the production gate record.

## API Key Leak

1. Identify the project, API key ID, scopes, last-used timestamp, source IPs, and affected endpoints.
2. Rotate the leaked API key from the dashboard or SDK and disable the old credential.
3. Review audit logs for suspicious organization, user, webhook, provider, SSO, SCIM, or key-management actions.
4. Revoke or rotate downstream resources touched by the leaked key.
5. Notify the customer owner when customer project material may be affected.
6. Attach rotation evidence, audit query references, and customer notification status to the production gate record.

## OAuth Provider Compromise

1. Disable the affected provider for impacted projects.
2. Rotate provider client secrets in the provider console and Banata vault.
3. Verify redirect URI allowlists for dashboard, hosted UI, and customer app callback domains.
4. Invalidate active OAuth state records and force re-auth for sessions created through the compromised provider.
5. Run a controlled OAuth callback test after rotation.
6. Attach provider config evidence, vault rotation record, failed stale-secret callback proof, and successful post-rotation callback proof.

## Webhook Outage

1. Confirm webhook delivery failure rate, dead-letter count, affected projects, and first failing delivery time.
2. Pause high-volume retries if they are worsening customer endpoint load.
3. Notify affected customers when events are delayed or may require replay.
4. Fix the delivery issue or customer endpoint configuration.
5. Replay dead-lettered deliveries idempotently and verify signatures on replay.
6. Attach delivery metrics, replay records, customer communication, and final dead-letter count.

## Audit Sink Failure

1. Confirm whether audit events are still written to the primary Banata audit store.
2. Identify the failed external sink, failure reason, affected projects, and last successful export.
3. Restore sink credentials, endpoint access, or queue processing.
4. Backfill missed events from the primary audit store.
5. Verify hash-chain continuity and external sink status recovery.
6. Attach sink failure metrics, backfill evidence, hash-chain verification, and recovery timestamp.

## Account Takeover

1. Lock the affected user and preserve audit evidence.
2. Revoke active sessions, refresh-token families, linked devices, API keys, passkeys, and MFA recovery codes as needed.
3. Require password reset, MFA reset, or step-up recovery through the approved support path.
4. Review recent organization membership, role, webhook, provider, SSO, SCIM, and API key changes.
5. Notify the customer admin and impacted user according to the incident communication policy.
6. Attach session revocation, device revocation, audit timeline, support ticket, and recovery confirmation.

## OTP Provider Outage

1. Confirm whether the outage affects SMS, WhatsApp, email OTP, or multiple channels.
2. Check provider health, Banata send error rate, queue latency, and retry behavior.
3. Disable unsafe automatic fallback loops. Switch providers only when the alternative has production-like credentials and approved templates where required.
4. Update the status page or customer incident channel when sign-in or verification is affected.
5. Run a redacted delivery test after recovery.
6. Attach provider incident reference, Banata metrics, status communication, and post-recovery delivery proof.
