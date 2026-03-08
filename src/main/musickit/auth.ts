import * as fs from 'fs';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

export function generateDeveloperToken(): string {
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const keyPath = process.env.APPLE_PRIVATE_KEY_PATH;

  if (!teamId || !keyId || !keyPath) {
    throw new Error('Missing Apple credentials in .env — check APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY_PATH');
  }

  const resolvedPath = path.resolve(process.cwd(), keyPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Private key file not found at: ${resolvedPath}`);
  }

  const privateKey = fs.readFileSync(resolvedPath, 'utf8');

  const now = Math.floor(Date.now() / 1000);

  const token = jwt.sign(
    {
      iss: teamId,
      iat: now,
      exp: now + 15552000, // 6 months
    },
    privateKey,
    {
      algorithm: 'ES256',
      keyid: keyId,
    }
  );

  return token;
}
