# 减肥追踪 (Weight Loss Tracker)

基于 **Expo / React Native** 的跨平台手机应用,帮助你记录每日体重、对比变化、可视化减肥进度。

## 功能

- 设置 **初始体重** 与 **理想(目标)体重**
- 每日记录当前体重(同一天可覆盖更新)
- 显示 **与昨日相比** 瘦了/胖了多少,绿色↓ / 红色↑
- 计算并展示 **减肥总进度** (百分比 + 进度条)
- **折线统计图** 展示体重变化趋势,并叠加目标线
- 历史记录列表,长按可删除
- 数据本地持久化 (`AsyncStorage`),重启不丢失

## 技术栈

- Expo SDK 51
- React Native 0.74
- React Navigation (Native Stack)
- react-native-chart-kit (折线图)
- @react-native-async-storage/async-storage (持久化)

## 运行

需要先安装 Node.js (>=18)。

```bash
cd expo-app
npm install
npx expo start
```

启动后:

- 用手机安装 **Expo Go** 应用,扫描终端二维码即可在真机预览
- 或按 `a` 启动 Android 模拟器,按 `i` 启动 iOS 模拟器,按 `w` 在浏览器预览

## 目录结构

```
expo-app/
├── App.js                    # 应用入口 + 路由
├── index.js                  # Expo 注册
├── app.json                  # Expo 配置
├── package.json
├── babel.config.js
└── src/
    ├── storage.js            # AsyncStorage 封装 (设置 + 记录)
    ├── utils.js              # 日期/格式化/进度计算工具
    └── screens/
        ├── SetupScreen.js    # 初始化 / 编辑目标
        └── HomeScreen.js     # 主页:今日输入、对比、总进度、折线图、历史
```

## 数据模型

- **Settings**: `{ initialWeight, targetWeight, createdAt }`
- **Record**: `{ date: 'YYYY-MM-DD', weight: number, note?: string }` (每天一条)

## 使用流程

1. 首次启动 → 进入「设置目标」页,输入初始体重与理想体重 → 保存
2. 进入主页,在「今日记录」输入今天的体重 → 保存
3. 主页自动显示:
   - 当前体重 / 已减重量 / 距目标差距
   - 总进度百分比
   - 与昨日对比 (绿色 = 瘦了,红色 = 胖了)
   - 折线趋势图 (近 14 天)
   - 完整历史记录 (长按删除)
4. 顶部「编辑」可修改目标,或在编辑页清空所有数据
