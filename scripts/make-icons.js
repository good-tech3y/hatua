const sharp = require('sharp');
const fs = require('fs');

const dir = 'assets/images';
fs.mkdirSync(dir, { recursive: true });

const mark = (x, y, s) =>
  `<g transform="translate(${x} ${y}) scale(${s})">` +
  `<path d="M7 41 H18 V31 H28 V21 H35" fill="none" stroke="#1A67B0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<circle cx="39.5" cy="9" r="4.5" fill="#F8FFA0" stroke="#1A67B0" stroke-width="3"/>` +
  `</g>`;

const wrap = (bg, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">` +
  (bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : '') +
  body +
  `</svg>`;

const jobs = [
  ['hatua-icon.png', wrap('#D8E6F7', mark(162, 187, 14))],
  ['hatua-adaptive.png', wrap(null, mark(220, 241, 11.67))],
  ['hatua-splash.png', wrap(null, mark(62, 94, 18))],
];

(async () => {
  for (const [name, svg] of jobs) {
    await sharp(Buffer.from(svg)).png().toFile(`${dir}/${name}`);
    console.log('made', name);
  }
})();
