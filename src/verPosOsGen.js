// 生成最终文件 version-position-os
const fs = require('fs');
const path = require('path');
const {
  dir,
  fileName,
  positionRegex,
  osList,
  getPosOsJsonName,
  getVerPosOsJsonName,
  downloadUrl,
  getVerPosLinkOsJsonName,
} = require('./constants');

const verPosOsDir = path.join(dir.base, dir.verPosOs);
const verPosOsLinkDir = path.join(dir.base, dir.verPosOsLink);

main();

function main() {
  let verPosMap = fs.readFileSync(
    path.join(dir.base, fileName.versionPosition),
    'utf8'
  );
  verPosMap = JSON.parse(verPosMap);

  Object.keys(verPosMap).forEach((v) => {
    const pos = verPosMap[v];
    if (!positionRegex.test(pos)) {
      delete verPosMap[v];
    }
  });

  osList.forEach((os) => {
    let posAttr = fs.readFileSync(
      path.join(dir.base, dir.position, getPosOsJsonName(os)),
      'utf8'
    );
    posAttr = JSON.parse(posAttr);
    let posMap = {};
    posAttr
      .filter((pos) => positionRegex.test(pos))
      .forEach((pos) => {
        posMap[pos] = pos;
      });

    // 过滤出最终有效的version-position-os
    let data = {};
    Object.entries(verPosMap).forEach(([v, p]) => {
      if (posMap[p]) {
        data[v] = p;
      }
    });

    if (!fs.existsSync(verPosOsDir)) {
      fs.mkdirSync(verPosOsDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(verPosOsDir, getVerPosOsJsonName(os)),
      JSON.stringify(data, null, 2)
    );

    // version-position-link-os
    const linkData = Object.keys(data).reduce((o, v) => {
      const pos = data[v];
      o[v] = `${downloadUrl}${os}/${pos}/`;
      return o;
    }, {});

    if (!fs.existsSync(verPosOsLinkDir)) {
      fs.mkdirSync(verPosOsLinkDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(verPosOsLinkDir, getVerPosLinkOsJsonName(os)),
      JSON.stringify(linkData, null, 2)
    );

    console.log(`${os} finish all -----------------------------`);
  });
}
