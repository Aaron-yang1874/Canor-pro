name: Pull Request
description: 提交 Pull Request
title: "[PR]: "
labels: ["pull-request"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        ## 📝 Pull Request 描述

        请详细描述您的更改。

  - type: textarea
    id: changes
    attributes:
      label: 更改内容
      description: 这次 PR 做了什么更改？
      placeholder: |
        - 添加了...
        - 修改了...
        - 修复了...
    validations:
      required: true

  - type: textarea
    id: motivation
    attributes:
      label: 动机
      description: 这个更改的动机是什么？
      placeholder: |
        这个更改是为了解决...
    validations:
      required: true

  - type: textarea
    id: testing
    attributes:
      label: 测试
      description: 如何测试这些更改？
      placeholder: |
        测试步骤...
    validations:
      required: true

  - type: textarea
    id: breaking
    attributes:
      label: Breaking Changes
      description: 这个 PR 是否有破坏性更改？
      placeholder: |
        没有破坏性更改 / 破坏性更改包括...
    validations:
      required: false

  - type: textarea
    id: checklist
    attributes:
      label: 检查清单
      description: 请确认以下项目
      placeholder: |
        - [ ] 代码通过 lint 检查
        - [ ] 添加了测试
        - [ ] 更新了文档
    validations:
      required: false

  - type: checkboxes
    id: terms
    attributes:
      label: 确认
      options:
        - label: 我的代码遵循项目的代码规范
          required: true
        - label: 我的更改不破坏现有功能
          required: true
        - label: 我已将分支基于最新的 main 分支
          required: true
