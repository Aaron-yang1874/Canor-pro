import { CanorPlugin } from '@canor/core';

export default {
  name: '{{name}}',
  version: '1.0.0',
  description: '{{description}}',
  author: '{{author}}',
  async activate(): Promise<void> {
    console.log('{{name}} plugin activated');
  },
  async deactivate(): Promise<void> {
    console.log('{{name}} plugin deactivated');
  }
} satisfies CanorPlugin;
