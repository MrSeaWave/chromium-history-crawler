# chromium-history-crawler

获取谷歌浏览器历史数据

仓库代码借鉴[chromium-history-version-crawler](https://github.com/vikyd/chromium-history-version-crawler)

数据保存地址：https://github.com/MrSeaWave/chromium-history-dataSource

## Step_1

寻找 Chromium 所有版本：`chromium_base_position` + [`versionUrl`](https://chromium.googlesource.com/chromium/src/+refs) && `versionPositionUrl`[https://omahaproxy.appspot.com/deps.json?version=] ====>生成 `all-version.json`, `version-position.json` 。

```bash
node ./src/getPositionByVersion.js
```

`all-version.json`:

```json
[
  "90.0.4399.1",
  "90.0.4399.0",
  "90.0.4398.1",
  "90.0.4398.0"
  // ...
]
```

`version-position.json`:

```json
{
  "90.0.4399.1": "846615",
  "90.0.4399.0": "846615",
  "90.0.4398.1": "846545",
  "90.0.4398.0": "846545"
  // ...
}
```

## Step_2

寻找关于 os 的 position：`position/position-Mac.json`...

```bash
node ./src/getPositionWithOsList.js
```

`position-Mac.json`:

```json
[
  "15734",
  "15749",
  "15839",
  "15942"
  // ...
]
```

## Step_3

`version-position.json` && `position/position-os.json` ===> `version-position-Mac.json` etc.

```bash
 node ./src/verPosOsGen
```

`ver-pos-os.json`:

```json
{
  "90.0.4398.1": "846545",
  "90.0.4398.0": "846545",
  "90.0.4396.2": "845872",
  "90.0.4396.1": "845872"
  // ...
}
```

## json steps

```
all-version.json -> version-position.json ->
                                              -> ver-pos-[os].json
                       position-[os].json ->
```

## 缺少某些版本？

某些版本可能缺少，因为没有从 API 返回任何数据：

- 数据正常：https://omahaproxy.appspot.com/deps.json?version=87.0.4253.0
- 没有数据：https://omahaproxy.appspot.com/deps.json?version=33.0.1733.0
