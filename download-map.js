import fs from 'fs';

async function download() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/benschwarz/simple-world-map/master/world.svg');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const text = await res.text();
    fs.writeFileSync('public/world-map.svg', text);
    console.log('Successfully downloaded SVG world map!');
  } catch (error) {
    console.error('Failed to download:', error);
  }
}

download();
