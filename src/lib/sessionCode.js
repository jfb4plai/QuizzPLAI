const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
const CODE_LENGTH = 6;

export function generateSessionCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export function isValidSessionCode(code) {
  if (typeof code !== 'string' || code.length !== CODE_LENGTH) return false;
  const pattern = new RegExp(`^[${ALPHABET}]{${CODE_LENGTH}}$`);
  return pattern.test(code);
}
