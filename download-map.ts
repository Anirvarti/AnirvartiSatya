import fs from 'fs';
import https from 'https';

const file = fs.createWriteStream("public/world-map.svg");

https.get('https://raw.githubusercontent.com/benschwarz/simple-world-map/master/world.svg', (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download map: ${res.statusCode} ${res.statusMessage}`);
    return;
  }
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Successfully downloaded SVG world map!');
  });
}).on('error', (err) => {
  fs.unlink('public/world-map.svg', () => {});
  console.error(`Error downloading file: ${err.message}`);
});
