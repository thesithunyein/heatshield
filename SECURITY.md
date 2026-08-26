# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within HeatShield, please send an email to **sithunyein.mailto@gmail.com**. All security vulnerabilities will be promptly addressed.

**Please do not** open a public GitHub issue to report security vulnerabilities.

## Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 5 business days
- **Fix Released:** Within 14 business days (depending on severity)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes             |

## Security Measures

### API Key Protection

- All API keys are stored server-side in environment variables
- No API keys are exposed to the client-side JavaScript
- API routes act as a proxy, keeping credentials on the server

### Data Protection

- No user data is stored or logged
- All API communication uses HTTPS
- No cookies or tracking beyond Vercel analytics

### Dependencies

- Regular dependency audits via `npm audit`
- Automated security alerts via GitHub Dependabot

## Best Practices for Contributors

1. Never commit API keys or secrets
2. Use environment variables for all sensitive configuration
3. Validate all user input on the server side
4. Use HTTPS for all external API calls
5. Follow the principle of least privilege
