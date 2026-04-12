import dns from 'dns';
import dotenv from 'dotenv';

// Force Node.js to use Google DNS — fixes SRV record resolution on some Windows/ISP configs
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ override: true });
