# Security Policy

The VTTTools team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

## Supported Versions

VTTTools is currently in active development and has not yet reached a stable release. Security fixes are applied directly to the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

Once stable releases are available, this section will be updated to reflect which versions receive security updates.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them using GitHub's Security Advisory feature:

1. Go to the [Security tab](../../security) of this repository
2. Click "Report a vulnerability"
3. Fill out the form with as much detail as possible

### What to Include

When reporting a vulnerability, please include:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Affected components or versions
- Potential impact of the vulnerability
- Any suggested mitigations (if known)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 3 business days
- **Initial Assessment**: We will provide an initial assessment within 7 business days
- **Updates**: We will keep you informed of our progress every 14 days until resolution
- **Resolution Timeline**:
  - Critical severity: Target fix within 7 days
  - High severity: Target fix within 30 days
  - Medium severity: Target fix within 90 days
  - Low severity: Best effort basis

## Vulnerability Handling Process

1. **Report Received**: We acknowledge your report and begin investigation
2. **Assessment**: We assess the severity and impact of the vulnerability
3. **Development**: We develop a fix in a private branch
4. **Coordination**: We coordinate disclosure timing with you
5. **Release**: We release the fix and publish a security advisory
6. **Credit**: We credit you in the advisory (unless you prefer anonymity)

## Scope

### In Scope

- VTTTools application source code
- Official deployment configurations
- Authentication and authorization mechanisms
- Data handling and storage

### Out of Scope

- Third-party dependencies (please report to the upstream maintainer)
- Social engineering attacks
- Denial of service attacks
- Issues in environments not officially supported

## Safe Harbor

We consider security research conducted in accordance with this policy to be:

- Authorized concerning any applicable anti-hacking laws
- Authorized concerning any relevant anti-circumvention laws
- Exempt from restrictions in our Terms of Service that would interfere with conducting security research

We will not pursue civil action or initiate a complaint to law enforcement for accidental, good-faith violations of this policy. We consider security research conducted consistent with this policy to be "authorized" under the Computer Fraud and Abuse Act.

We ask that you:

- Make a good-faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our services
- Only interact with accounts you own or with explicit permission of the account holder
- Do not exploit a security issue for purposes other than verification
- Report any vulnerability you discover promptly
- Keep vulnerability details confidential until we have addressed the issue

## Questions

If you have questions about this policy, please open a discussion in the repository.
