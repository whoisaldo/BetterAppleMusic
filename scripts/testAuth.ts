import { verifyToken } from '../electron/musickit/verify';

verifyToken().then(() => {
  console.log('\nPhase 2 complete — credentials wired and verified.');
}).catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
