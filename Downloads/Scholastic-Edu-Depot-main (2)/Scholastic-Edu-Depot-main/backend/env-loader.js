import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default process.env;
