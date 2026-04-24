# Security Policy

## Supported Versions

The latest release on the `main` branch receives security updates. Older versions are not actively maintained.

| Version | Supported |
| ------- | --------- |
| main    | Yes       |
| < 1.0   | No        |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability in Raino, please report it responsibly.

**Preferred method:** Open a [GitHub Security Advisory](https://github.com/raino-eda/raino/security/advisories/new). This is private by default and only visible to maintainers until a fix is released.

**Alternative method:** Email security@raino-eda.com with the subject line "Raino Security Vulnerability". Encrypt your email with PGP if the vulnerability is sensitive. Our PGP key fingerprint is published on our website.

### What to Include

- A clear description of the vulnerability.
- Steps to reproduce the issue, if applicable.
- The affected component or package.
- Any potential impact (what an attacker could do).
- Whether you believe the vulnerability is exploitable in production.
- Your name and whether you would like credit in the advisory.

### What to Expect

1. We will acknowledge your report within 48 hours.
2. We will investigate and determine severity.
3. We will keep you informed of progress toward a fix.
4. We will coordinate a disclosure date with you. We aim to publish a fix within 90 days of the initial report, sooner for critical issues.
5. We will credit you in the security advisory unless you request otherwise.

### Disclosure Policy

- We follow coordinated disclosure. Please do not publicly disclose the vulnerability before we have shipped a fix.
- If the vulnerability is already publicly known, let us know immediately so we can prioritize the fix.
- We will publish a GitHub Security Advisory once the fix is available, including a CVE where appropriate.

## Scope

This policy covers:

- The Raino source code in this repository.
- Raino services deployed under the raino-eda.com domain.
- Dependencies that are part of the Raino distribution.

This policy does not cover:

- Vulnerabilities in third-party services (Supabase, DigiKey, Mouser, JLCPCB). Report those to their respective security teams.
- Vulnerabilities in KiCad, which is a separate project with its own security policy.
- Social engineering or phishing attacks against Raino users.

## Security Best Practices for Contributors

- Never commit API keys, tokens, passwords, or secrets to the repository. Use environment variables.
- The project runs in degraded/fixture mode without credentials. Never hard-code fallback credentials.
- Review dependency updates for known vulnerabilities before merging.
- Report anything suspicious, even if you are not sure it is exploitable.
