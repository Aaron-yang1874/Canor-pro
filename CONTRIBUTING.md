# 贡献指南

感谢您对 Canor 项目的关注！我们欢迎各种形式的贡献，包括但不限于代码提交、问题报告、文档改进等。

## 开始之前

在开始贡献之前，请确保：

1. 阅读并理解我们的 [行为准则](CODE_OF_CONDUCT.md)
2. 检查是否有已存在的 Issue 或 Pull Request 与您的想法相关
3. 对于重大更改，请先打开一个 Issue 讨论您的想法

## 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/Aaron-yang1874/Canor-pro.git
cd Canor-pro

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 分支命名规范

- `feat/` - 新功能（例如：`feat/multimodal-input`）
- `fix/` - Bug 修复（例如：`fix/audio-playback`）
- `docs/` - 文档更新
- `refactor/` - 代码重构
- `test/` - 测试相关
- `chore/` - 其他杂项

## Pull Request 流程

1. Fork 仓库并从 `main` 分支创建您的功能分支
2. 确保代码通过所有测试和 Lint 检查
3. 更新相关文档
4. 提交 PR 并描述您的更改
5. 等待代码审查

## 代码规范

- 使用 TypeScript 进行开发
- 遵循项目的 ESLint 配置
- 添加适当的测试覆盖
- 保持提交信息清晰明了

## 提交信息规范

我们使用 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更改
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 杂项

## 测试

```bash
# 运行所有测试
npm test

# 运行测试覆盖率报告
npm run test:coverage
```

## 问题报告

请使用 GitHub Issues 报告 Bug。对于安全漏洞，请查看 [安全策略](SECURITY.md)。

## 许可证

通过贡献代码，您同意将您的作品根据项目的 MIT 许可证发布。
