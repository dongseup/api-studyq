
import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';

// Load .env
const myEnv = dotenv.config({ path: '.env' });
expand(myEnv);

function debugConnection() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL is undefined');
    return;
  }

  try {
    const dbUrl = new URL(url);
    console.log('✅ DATABASE_URL Parsing Analysis:');
    console.log(`- Host: ${dbUrl.hostname}`);
    console.log(`- Port: ${dbUrl.port || 3306}`);
    console.log(`- Username: ${dbUrl.username}`);
    
    const password = dbUrl.password;
    console.log(`- Password Length: ${password.length}`);
    // Print ASCII codes to verify content without revealing the password
    const charCodes = password.split('').map(c => c.charCodeAt(0));
    console.log(`- Password Char Codes: ${JSON.stringify(charCodes)}`);
    
    // Check for specific problematic characters
    if (password.includes('@')) console.log('⚠️ Password contains "@" (ASCII 64)');
    if (password.includes('%')) console.log('⚠️ Password contains "%" (ASCII 37)');
    
    console.log('---');
    console.log('Checking raw string for special chars (heuristic):');
    const rawMatches = url.match(/:([^:@]+)@/); // Crude regex to find password part
    if (rawMatches && rawMatches[1]) {
        console.log(`- Raw password part length in URL: ${rawMatches[1].length}`);
        if(rawMatches[1] !== password && decodeURIComponent(rawMatches[1]) === password) {
             console.log('ℹ️ URL encoding detected and correctly decoded.');
        } else if (rawMatches[1] !== password) {
             console.log('⚠️ Raw password part does match parsed password. Potential parsing issue or unencoded special chars.');
        }
    }

  } catch (error) {
    console.error('❌ Error parsing DATABASE_URL:', error);
  }
}

debugConnection();
