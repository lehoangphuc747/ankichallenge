import fs from 'node:fs';
import path from 'node:path';

const files = fs.readdirSync('discord-export');
console.log('Files in discord-export:', files.filter(f => f.endsWith('.json')));
