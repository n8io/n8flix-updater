const { existsSync, truncate } = require('fs');
const { multiply } = require('ramda');

const seconds = multiply(1000);

const log = msg => {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'America/New_York'
  };

  const dt = new Intl.DateTimeFormat('en-US', options).format(new Date());

  console.log(`${dt}: ${msg}`);
};

const truncateLog = () => {
  const filePath = `./commands.log`;
  const exists = existsSync(filePath);

  if (!exists) return;

  log(`Truncating log file...`);

  truncate(filePath, 0, () => {});
};

const rotateLog = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const isTime = hours === 3 && minutes === 00;

  if (!isTime) return;

  truncateLog();
};

const start = () => {
  rotateLog();

  return setInterval(rotateLog, seconds(30));
};

module.exports = { log, start };
