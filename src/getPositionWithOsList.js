const fs = require('fs');
const path = require('path');
const got = require('got');
const {
  osList,
  positionUrl,
  posReplaceExample,
  posReplaceStr,
  posQueryPageToken,
  positionRegex,
  dir,
  getPosOsJsonName,
} = require('./constants');

main();

async function main() {
  let promiseAll = [];
  osList.forEach((os) => {
    promiseAll.push(doIt(os));
  });

  await Promise.all(promiseAll);
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

async function doIt(os, posArr = [], pageToken) {
  try {
    let url = positionUrl.replace(posReplaceExample, `${posReplaceStr}${os}`);
    if (pageToken) {
      url = `${url}&${posQueryPageToken}${pageToken}`;
    }

    const resp = await got(url);
    const data = JSON.parse(resp.body);
    if (!data.prefixes) {
      console.log(`${os} no prefixes`);
      return;
    }

    data.prefixes.forEach((item) => {
      const arr = item.split('/');
      if (arr.length < 2) {
        console.log(`${os} position not correct: ${item}`);
        return;
      }
      const posStr = arr[1];
      if (!positionRegex.test(posStr)) {
        console.log(`${os} position not correct: ${item}`);
        return;
      }
      posArr.push(posStr);
    });

    console.log(`------ ${os} success count: ${posArr.length} ------`);

    if (data.nextPageToken) {
      return doIt(os, posArr, data.nextPageToken);
    } else {
      posArr.sort((a, b) => collator.compare(a, b));
      const posDir = path.join(dir.base, dir.position);
      if (!fs.existsSync(posDir)) {
        fs.mkdirSync(posDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(posDir, getPosOsJsonName(os)),
        JSON.stringify(posArr, null, 2)
      );

      console.log(`${os} finish all -----------------------------`);
      return posArr;
    }
  } catch (e) {
    console.log(e);
  }
}
