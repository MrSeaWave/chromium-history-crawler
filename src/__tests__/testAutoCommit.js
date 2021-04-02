const path = require('path');
const fs = require('fs');
const { dir, fileName } = require('../constants');

const data = { tem: 1 };

const verPosPath = path.join(dir.base, fileName.versionPosition);

if (!fs.existsSync(path.join(dir.base))) {
  fs.mkdirSync(path.join(dir.base));
}

fs.writeFileSync(path.join(verPosPath), JSON.stringify(data, null, 2));
