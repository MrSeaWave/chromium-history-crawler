# chromium-history-crawler

获取谷歌浏览器历史数据

- 网页：https://mrseawave.github.io/chromium-history-page/
- 网页源码：https://github.com/MrSeaWave/chromium-history-page
- dataSource：https://github.com/MrSeaWave/chromium-history-dataSource
- crawler(BASE): https://github.com/MrSeaWave/chromium-history-crawler

仓库代码借鉴[chromium-history-version-crawler](https://github.com/vikyd/chromium-history-version-crawler)

## Step_1

寻找所有的 version&&version 对应的 position

```bash getPositionByVersion
$ node ./src/getPositionByVersion.js
```

[`versionUrl`](https://chromium.googlesource.com/chromium/src/+refs) + [`versionPositionUrl`](https://omahaproxy.appspot.com/deps.json?version=])====>生成 `all-version.json`, `version-position.json`

- `versionUrl` ：爬虫获取所有 version
- `versionPositionUrl`: 通过指定的 version 获取特定的 position

`all-version.json`:

```json all-version.json
[
  "90.0.4399.1",
  "90.0.4399.0",
  "90.0.4398.1",
  "90.0.4398.0"
  // ...
]
```

`version-position.json`:

```json version-position.json
{
  "90.0.4399.1": "846615",
  "90.0.4399.0": "846615",
  "90.0.4398.1": "846545",
  "90.0.4398.0": "846545"
  // ...
}
```

## Step_2

寻找不同 os 对应的 position：`position/position-Mac.json` etc.

```bash getPositionWithOsList
$ node ./src/getPositionWithOsList.js
```

[`positionUrl`](<https://www.googleapis.com/storage/v1/b/chromium-browser-snapshots/o?delimiter=/&prefix=Mac/&fields=items(kind,mediaLink,metadata,name,size,updated),kind,prefixes,nextPageToken>)====>`position/position-Mac.json`

`position-Mac.json`:

```json position-Mac.json
[
  "15734",
  "15749",
  "15839",
  "15942"
  // ...
]
```

## Step_3

结合`step_1`与`step_2`的数据生成最终文件：`ver-pos-os/version-position-Mac.json`

```bash verPosOsGen.js
$  node ./src/verPosOsGen
```

`version-position.json` && `position/position-os.json` ===> `ver-pos-os/version-position-Mac.json` etc.

`ver-pos-os.json`:

```json ver-pos-os.json
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
