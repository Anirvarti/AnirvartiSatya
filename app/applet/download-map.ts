import fs from 'fs';
import https from 'https';

https.get('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => fs.writeFileSync('public/world-map.svg', data));
});
