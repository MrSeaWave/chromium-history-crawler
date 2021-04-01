const { getopt } = require('stdio');
const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
const path = require('path');
const Crawler = require('crawler');

const { dir, versionUrl, versionRegex, fileName } = require('./constants');

const modes = {
  inc: 'inc',
  all: 'all',
};

const allDefaultOpts = {
  mode: modes.inc,
  maxConnections: 10,
  loopTimes: 10,
  loopInterval: 5,
};

const incDefaultOpts = {
  mode: modes.inc,
  maxConnections: 3,
  loopTimes: 3,
  loopInterval: 3,
};

// 获取命令行参数
const receivedOpts = getopt({
  mode: {
    key: 'm',
    description:
      '`all`: first crawl positions of all version, or `inc`: incremental mode(much less request and less error)',
    default: modes.inc,
  },
  maxConnections: {
    key: 'c',
    description:
      'max connections of crawling positions, default `all`: 10, `inc`: 3',
  },
  loopTimes: {
    key: 'l',
    description:
      'times to loop all needed fetch versions, default `all`: 10, `inc`: 3',
  },
  loopInterval: {
    key: 'i',
    description: 'seconds between each loop, default `all`: 5, `inc`: 3',
  },
  beginVerIndex: {
    key: 'b',
    default: 0,
  },
  saveStepSize: {
    key: 's',
    description:
      'used for `all` only, save to file after this count of request',
    default: 1000,
  },
});

function optsToNumber(key, value) {
  if (key !== 'mode') return Number(value);
  return value;
}

let opts = {};
Object.entries(receivedOpts).forEach(([key, value], index) => {
  if (key !== 'args') {
    opts[key] = optsToNumber(key, value);
    if (value === true) opts[key] = optsToNumber(key, receivedOpts.args[index]);
  }
});

opts = {
  ...(opts.mode === modes.all ? allDefaultOpts : incDefaultOpts),
  ...opts,
};

console.log('opts', opts, receivedOpts);

// 运行入口
main();

async function main() {
  if (!fs.existsSync(dir.base)) {
    fs.mkdirSync(dir.base, { recursive: true });
  }
  switch (opts.mode) {
    case modes.all:
      console.log('mode: all');
      await mainFirstFull();
      break;
    case modes.inc:
      console.log('mode: inc');
      await mainIncrease();
      break;
    default:
      // 默认不会走到这步
      console.log('error mode');
      break;
  }
  console.log('----------main finished--------');
}

async function mainFirstFull() {
  for (let i = 1; i <= opts.loopTimes; i++) {
    console.log(`round ${i} begin ------------`);
    const maxVerCount = 30000;
    const halfStep = Math.floor(opts.saveStepSize / 2);
    for (let j = opts.beginVerIndex; j < maxVerCount; j += halfStep) {
      try {
        await doIt(j);
      } catch (e) {
        console.error(e);
      }
    }
    await sleep(opts.loopInterval * 1000);
    console.log(`round ${i} end ------------`);
  }
}

async function mainIncrease() {
  for (let i = 1; i <= opts.loopTimes; i++) {
    console.log(`round ${i} begin ------------`);
    try {
      const isFinish = await doIt(opts.beginVerIndex);
      if (isFinish) {
        break;
      }
    } catch (e) {
      console.error(error);
    }
    await sleep(opts.loopInterval * 1000);
    console.log(`round ${i} end ------------`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// about sort: https://stackoverflow.com/a/38641281/2752670
const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

async function doIt(beginVerIndex) {
  // 请求到静态的HTML文档
  const resp = await got(versionUrl);
  const $ = cheerio.load(resp.body);
  const $titles = $('.RefList-title');
  let $RefListItems = [];
  // 获取版本 li element
  $titles.each(function (i, elem) {
    const $item = $(this);
    const text = $item.text();
    console.log(`version page: ${text}`);
    if (text === 'Tags') {
      $RefListItems = $item.next().children('li');
    }
  });

  if ($RefListItems.length === 0) {
    console.error('no version data!');
    return;
  }

  console.log(`version count raw: ${$RefListItems.length}`);

  // 获取版本列表 text
  let versions = [];
  $RefListItems.each(function (i, elem) {
    const $item = $(this);
    const ver = $item.text();
    const v = ver.trim();
    if (versionRegex.test(v)) {
      versions.push(v);
    } else {
      console.log(`invalid version: ${v}`);
    }
  });
  console.log(`version count valid: ${versions.length}`);
  // 版本从大到小排序
  versions.sort((a, b) => collator.compare(b, a));
  // 将所有版本写入至allVersion.json
  fs.writeFileSync(
    path.join(dir.base, fileName.allVersion),
    JSON.stringify(versions, null, 2)
  );

  // 开始寻找version对应的position
  let verPosMap = {};
  const crawler = new Crawler({
    // 禁用注入jQuery选择器
    jQuery: false,
    // 最大并发数
    maxConnections: 3,
    // This will be called for each crawled page
    callback: function (error, res, done) {
      if (error) {
        console.log(error);
        done();
        return;
      }
      let $ = res.$;
      let bodyObj = '';
      // https://github.com/bda-research/node-crawler#custom-parameters
      const v = res.options.myVersion;
      if (res.body.includes('Traceback')) {
        console.log(`------ ${v} --- ${res.body} ------`);
        verPosMap[v] = 'ErrorWithTraceback';
        done();
        return;
      }
      try {
        bodyObj = JSON.parse(res.body);
      } catch (e) {
        console.log(`------ ${v} --- ${res.body} ------`);
        done();
        return;
      }
      const pos = bodyObj.chromium_base_position;
      if (!pos) {
        console.log(`version ${v} position ${pos}`);
      } else {
        console.log(`version ${v} match position ${pos}`);
      }
      verPosMap[v] = pos;
      done();
    },
  });

  const oldVerPosStr = fs.readFileSync(
    path.join(dir.base, fileName.versionPosition),
    'utf8'
  );
  const oldVerPosMap = JSON.parse(oldVerPosStr);
  versions = versions.filter((v) => !oldVerPosMap.hasOwnProperty(v));

  const needToFetchCount = versions.length;
  console.log(`need to fetch count: ${needToFetchCount}`);

  if (needToFetchCount === 0) {
    return true;
  }

  let count = 0;
  for (let i = beginVerIndex; i < versions.length; i++) {
    const v = versions[i];
    if (i === 1) {
      console.log(`first fetch version: ${v}`);
    }
    const url = `${versionPositionUrl}${v}`;
    crawler.queue({ uri: url, myVersion: v });
    count++;
    if (opts.mode === modes.all) {
      if (count >= opts.saveStepSize) {
        break;
      }
    }
  }

  return await new Promise((resolve) => {
    crawler.on('drain', function () {
      console.log('crawler drain event');
      let allVerPosMap = { ...oldVerPosMap, ...verPosMap };
      const successCount =
        Object.keys(allVerPosMap).length - Object.keys(oldVerPosMap).length;
      console.log(`success count : ${successCount}`);

      // sort keys
      allVerPosMap = Object.entries(allVerPosMap).sort((a, b) =>
        collator.compare(b, a).reduce((o, [v, p]) => {
          o[v] = p;
          return o;
        }, {})
      );
      fs.writeFileSync(
        path.join(dir.base, fileName.versionPosition),
        JSON.stringify(allVerPosMap, null, 2)
      );

      const fileName = __filename.slice(__dirname.length + 1);
      console.log(`${fileName} : finish`);

      resolve(successCount === needToFetchCount);
    });
  });
}

doIt();
