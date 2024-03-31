import { defineValaxyConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'
import { addonWaline } from 'valaxy-addon-waline'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

  theme: 'yun',


    // 设置 valaxy-addon-waline 配置项
    addons: [
      addonWaline({
        // Waline 配置项，参考 https://waline.js.org/reference/client/props.html
        serverURL: 'https://waline.mewhz.com',
      }),
    ],

    
  themeConfig: {
    banner: {
      enable: true,
      title: '星星得不到爱火',
      cloud: {
        enable: true,
      },
    },

    bg_image : {
      enable: true,
      url: 'https://pic.mewhz.com/img/bg.jpg',
      opacity: 0.2,
    },

    colors: {
      primary: '#73D7F8'
    },

    fireworks : {
      enable: true,
      colors: ["#F73859", "#14FFEC", "#00E0FF", "#FF99FE", "#FAF15D"],
    },

    pages: [],

    footer: {
      since: 2019,
      powered: true,
      beian: {
        enable: true,
        icp: '冀ICP备19018681号',
      },
    },

    menu: {
      custom: {
        title: '小伙伴们',
        url: '/links/',
        icon: 'i-ri-genderless-line',
      }
    },

  },

  unocss: { safelist },
})
