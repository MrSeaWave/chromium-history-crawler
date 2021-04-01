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
const positionUrl =
  'https://www.googleapis.com/storage/v1/b/chromium-browser-snapshots/o?delimiter=/&prefix=Mac/&fields=items(kind,mediaLink,metadata,name,size,updated),kind,prefixes,nextPageToken';
const downloadUrl =
  'https://commondatastorage.googleapis.com/chromium-browser-snapshots/index.html?prefix=';

const posReplaceExample = 'prefix=Mac';
const posReplaceStr = 'prefix=';
const posQueryPageToken = 'pageToken=';

const positionRegex = /^[0-9]+$/;
const versionRegex = /^[0-9][0-9.]*[0-9]$/;

const osList = ['Mac', 'Win_x64', 'Win', 'Linux_x64', 'Linux', 'Android'];

const getPosOsJsonName = (os) => `${fileName.positionPrefix}${os}.json`;
const getVerPosOsJsonName = (os) => `${fileName.osVerPosPrefix}${os}.json`;
const getVerPosLinkOsJsonName = (os) =>
  `${fileName.osVerPosLinkPrefix}${os}.json`;

module.exports = {
  dir,
  fileName,
  versionRegex,
  positionRegex,
  versionUrl,
  versionPositionUrl,
  positionUrl,
  downloadUrl,
  posReplaceExample,
  posReplaceStr,
  posQueryPageToken,
  osList,
  getPosOsJsonName,
  getVerPosOsJsonName,
  getVerPosLinkOsJsonName,
};
