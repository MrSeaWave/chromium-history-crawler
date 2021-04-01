let saveStepSize = 6;
let beginVerIndex = 0;
let oldVerPosMap = {};
let versions = [...new Array(10000)].map((v, i) => i);

function mainFirstFull() {
  for (let i = 1; i <= 10; i++) {
    console.log(`round ${i} begin ...`);
    const MaxVerCount = 30;
    const halfStep = Math.floor(saveStepSize / 2);
    for (let j = beginVerIndex; j < MaxVerCount; j += halfStep) {
      try {
        console.log('begin--->', j);
        doIt(j);
      } catch (e) {
        console.error(e);
      }
    }
    console.error(`round ${i} end ---------------`);
  }
}
const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

function doIt(beginIdx) {
  versions.sort((a, b) => collator.compare(b, a));
  versions = versions.filter((v) => !oldVerPosMap.hasOwnProperty(v));
  console.log('versons', versions);
  let count = 0;
  for (let i = beginIdx; i < versions.length; i++) {
    const v = versions[i];
    if (i === 1) {
      console.log(`first fetch version: ${v}`);
    }
    oldVerPosMap[v] = 'p' + v;
    count++;
    if (count >= saveStepSize) {
      console.log('old', oldVerPosMap);
      break;
    }
  }
}

mainFirstFull();
