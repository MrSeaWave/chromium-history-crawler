const dir = {
  base: 'json',
  verPosOs: 'ver-pos-os',
  verPosOsLink: 'ver-pos-os-link',
  position: 'position',
};

const fileName = {
  allVersion: 'all-version.json',
  versionPosition: 'version-position.json',
  positionPrefix: 'position-',
  osVerPosPrefix: 'version-position-',
  osVerPosLinkPrefix: 'version-position-link-',
};

const versionUrl = 'https://chromium.googlesource.com/chromium/src/+refs';
const versionPositionUrl = 'https://omahaproxy.appspot.com/deps.json?version=';

const positionRegex = /^[0-9]+$/;
const versionRegex = /^[0-9][0-9.]*[0-9]$/;

module.exports = {
  dir,
  fileName,
  versionRegex,
  positionRegex,
  versionUrl,
  versionPositionUrl,
};
