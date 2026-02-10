import { createApp, h } from 'vue'
import App from './App.vue'
import { NConfigProvider, type GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#5E5CE5',
    primaryColorHover: '#7C7AE8',
    primaryColorPressed: '#4B49D1',
    primaryColorSuppl: '#5E5CE5'
  }
}

createApp({
  render: () =>
    h(
      NConfigProvider,
      { themeOverrides },
      {
        default: () => h(App)
      }
    )
}).mount('#app')
