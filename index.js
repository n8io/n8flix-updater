const chokidar = require('chokidar');
const got = require('got');

const {
  DRY_RUN = '',
  HOST = 'plex.n8io.com',
  PATHNAME = '',
  PROTOCOL = 'http',
  PORT = '1981',
  WATCH_DIR = '/mnt/x/decrypted/**/*.(mkv|mp4|avi|n8)'
} = process.env;

const uri = `${PROTOCOL}://${HOST}:${PORT}/${PATHNAME}`;

const sendPath = async tmpPath => {
  let path = tmpPath;

  if (tmpPath && !tmpPath.startsWith('/')) {
    path = `/${tmpPath}`;
  }

  return library;
};

const tranformPath = path => {
  const reg = /([/]mnt[/]x[/]decrypted[/](tv|movies)[/](adult|release|prerelease))[/].*[/]/g;

  const validPath = ((path || '').match(reg) || [])[0];

  return validPath;
};

const makeCommand = (path, library) => {
  return `LD_LIBRARY_PATH="/usr/lib/plexmediaserver" PLEX_MEDIA_SERVER_APPLICATION_SUPPORT_DIR="/home/plexmediaserver/Library/Application Support" "/usr/lib/plexmediaserver/Plex Media Scanner" --scan --no-thumbs --section ${library} --directory "${path}"`;
};

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

const handleRequest = (req, res) => {
  const { debug, path: tmpPath } = req.body;

  const path = tranformPath(tmpPath);

  if (!path) {
    return res.status(400).json({ message: 'No path provided in the payload' });
  }

  log(`input ${tmpPath}`);

  const library = parseLibrary(path);

  if (!library) {
    return res
      .status(400)
      .json({ message: 'Unable to determine library from path', path });
  }

  const command = makeCommand(path, library);

  log(`path ${path}`);
  log(`command ${command}`);

  if (!debug) {
    exec(command);
  } else {
    log('Debug enabled. Dry run only.');
  }

  return res.json({ message: 'OK', path, command });
};

app.use(bodyParser.json());

app.post('/', handleRequest);
app.get('/', (_, res) => res.json({ message: 'OK' }));

log(`Paths will be posted to ${uri}`);
log(`Watcher started for ${WATCH_DIR} ...`);
