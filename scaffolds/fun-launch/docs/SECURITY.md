# Security Documentation for Kogaion

This document outlines security practices, encryption, and secrets management for Kogaion.

## Table of Contents

1. [Secrets Management](#secrets-management)
2. [Encryption](#encryption)
3. [Environment Variables](#environment-variables)
4. [API Security](#api-security)
5. [Database Security](#database-security)
6. [Best Practices](#best-practices)

---

## Secrets Management

### Never Commit Secrets

**CRITICAL**: Never commit the following to version control:

- `.env` files
- `ENCRYPTION_KEY`
- `PINATA_JWT`
- `HUGGINGFACE_API_KEY`
- `DATABASE_URL` (production)
- Any private keys or tokens

### Git Configuration

Ensure `.gitignore` includes:
```
.env
.env.local
.env.production
*.key
*.pem
```

### Environment Variables

- Use `.env.example` as a template (no real values)
- Set secrets in Railway (or your hosting platform)
- Use different secrets for development and production
- Rotate secrets regularly

---

## Encryption

### Bot Token Encryption

Telegram bot tokens are encrypted at rest using **AES-256-GCM**.

#### Implementation

- **Algorithm**: AES-256-GCM
- **Key**: `ENCRYPTION_KEY` (32 bytes hex or any string)
- **Location**: `src/lib/encryption.ts` (web) and `apps/worker-bots/src/encryption.ts` (worker)

#### Key Requirements

1. **Same Key Everywhere**: `ENCRYPTION_KEY` must be identical in:
   - Web service (Next.js)
   - Worker service (Node.js)

2. **Key Generation**:
   ```bash
   npm run generate:encryption-key
   # or
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Key Storage**:
   - Store in environment variables (Railway, etc.)
   - Never commit to Git
   - Use strong, random keys (64 hex characters recommended)

#### Encryption Flow

1. **Encryption** (when bot is activated):
   ```typescript
   import { encrypt } from '@/lib/encryption';
   const encryptedToken = encrypt(botToken);
   // Store encryptedToken in database
   ```

2. **Decryption** (when bot starts):
   ```typescript
   import { decrypt } from './encryption';
   const decryptedToken = decrypt(encryptedToken);
   // Use decryptedToken to start bot
   ```

#### Security Properties

- **Authenticated Encryption**: GCM mode provides authentication
- **Nonce/IV**: Unique for each encryption (stored with ciphertext)
- **Tamper Detection**: Any modification to ciphertext is detected

---

## Environment Variables

### Required Secrets

| Variable | Purpose | Where Used | Sensitivity |
|----------|---------|------------|-------------|
| `PINATA_JWT` | Pinata IPFS API authentication | Web service | High |
| `RPC_URL` | Solana RPC endpoint | Web service | Medium |
| `DATABASE_URL` | PostgreSQL connection string | Web + Worker | High |
| `ENCRYPTION_KEY` | AES-256-GCM encryption key | Web + Worker | **CRITICAL** |
| `HUGGINGFACE_API_KEY` | HuggingFace API authentication | Worker | High |

### Optional Secrets

| Variable | Purpose | Where Used | Sensitivity |
|----------|---------|------------|-------------|
| `ALLOWED_ORIGIN` | CORS allowed origin | Web service | Low |

### Public Configuration

These are **NOT secrets** (can be committed):

- `POOL_CONFIG_KEY` (public Solana address)
- `NODE_ENV` (environment name)

---

## API Security

### Rate Limiting

Rate limiting is implemented via Next.js middleware (`src/middleware.ts`):

- **Upload endpoints**: 10 requests/minute per IP
- **Bot activation**: 5 requests/minute per IP
- **Bot confirmation**: 10 requests/minute per IP

### CORS Configuration

CORS is configured in `next.config.ts`:

- Default: `*` (allows all origins)
- Production: Set `ALLOWED_ORIGIN` to your domain

### Input Validation

All API routes validate:
- Required fields
- PublicKey format (Solana addresses)
- JSON structure
- File types and sizes (uploads)

### Error Handling

- Never expose sensitive data in error messages
- Log errors with structured logger (sanitizes secrets)
- Return generic errors to clients

---

## Database Security

### Connection Security

- Use SSL/TLS for database connections (Railway enforces this)
- `DATABASE_URL` includes SSL parameters automatically

### Data at Rest

- **Bot tokens**: Encrypted (AES-256-GCM) before storage
- **Other data**: Stored in plaintext (tokens, metrics, etc. are public)

### Access Control

- Database credentials stored in `DATABASE_URL`
- Never log `DATABASE_URL` in plaintext
- Use Prisma connection pooling (automatic)

---

## Best Practices

### 1. Secret Rotation

Rotate secrets regularly:
- **PINATA_JWT**: Every 90 days
- **HUGGINGFACE_API_KEY**: Every 90 days
- **ENCRYPTION_KEY**: Only if compromised (requires re-encrypting all bot tokens)

### 2. Logging

- Use structured logger (`src/lib/logger.ts`)
- Logger automatically sanitizes sensitive fields
- Never log:
  - `ENCRYPTION_KEY`
  - `PINATA_JWT`
  - `HUGGINGFACE_API_KEY`
  - Bot tokens (encrypted or decrypted)
  - Database passwords

### 3. Code Review

- Review all changes that touch encryption/decryption
- Verify no secrets are hardcoded
- Check `.env` files are not committed

### 4. Production Checklist

Before deploying to production:

- [ ] All secrets set in Railway (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] `ENCRYPTION_KEY` same in web and worker
- [ ] Rate limiting enabled
- [ ] CORS configured for your domain
- [ ] Database uses SSL/TLS
- [ ] Logs don't leak secrets
- [ ] Health checks don't expose sensitive data

### 5. Incident Response

If a secret is compromised:

1. **Immediately rotate** the compromised secret
2. **Revoke** old credentials (Pinata, HuggingFace, etc.)
3. **Audit logs** for unauthorized access
4. **Notify users** if bot tokens are affected
5. **Re-encrypt** bot tokens if `ENCRYPTION_KEY` is compromised

---

## Security Audit

### Regular Audits

Perform security audits:

1. **Monthly**: Review environment variables
2. **Quarterly**: Rotate API keys
3. **Annually**: Full security review

### Audit Checklist

- [ ] No secrets in Git history
- [ ] All secrets in environment variables
- [ ] Encryption key is strong and random
- [ ] Rate limiting is effective
- [ ] CORS is properly configured
- [ ] Database connections use SSL
- [ ] Logs don't leak secrets
- [ ] Error messages don't expose internals

---

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email security concerns to the maintainers
3. Include:
   - Description of the issue
   - Steps to reproduce
   - Potential impact

---

**Last Updated**: 2024-01-01
