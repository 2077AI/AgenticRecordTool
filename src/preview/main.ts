import { createApp, h } from 'vue';
import App from './App.vue';
import 'xgplayer/dist/index.min.css';
import '../styles/variables.css';
import { NConfigProvider, NDialogProvider, NMessageProvider, NNotificationProvider, NModalProvider } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui';

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
        default: () =>
          h(NDialogProvider, {}, {
            default: () =>
              h(NMessageProvider, {}, {
                default: () =>
                  h(NNotificationProvider, {}, {
                    default: () =>
                      h(NModalProvider, {}, {
                        default: () => h(App)
                      })
                  })
              })
          })
      }
    )
}).mount('#app')