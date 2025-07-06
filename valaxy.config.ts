import { defineValaxyConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'
import { addonWaline } from 'valaxy-addon-waline'
import { addonBangumi } from 'valaxy-addon-bangumi'

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

  addons: [
    // 设置 valaxy-addon-bangumi 配置项
    addonBangumi({
      api: 'https://mewhz-raspygraywolf.web.val.run',
      bilibiliEnabled: false,
      bgmUid: '872987',
      customCss: 
      `      
        .bbc-bangumi-label { width: 30%; padding: 0px 11px !important; }
        .bbc-bangumi-labels { margin-top: 10px; }
        div > .bbc-tabs:nth-of-type(1) { display: none; }
        .bbc-tabs:nth-of-type(3) { display: none; }
        .bbc-header-platform .bbc-tabs:nth-of-type(1) { gap: 8px; display: flex; }
        .divider { display: none; }
      `,
      /*
        .bbc-bangumi-label { width: 30%; } 设置 value 的宽度
        .bbc-bangumi-labels { margin-top: 10px; } 设置 value 和 标题的距离
        .divider { display: none; } 隐藏 分割线
        .bbc-header-platform .bbc-tabs:nth-of-type(1) { gap: 8px; display: flex; } 和下方的 css 选择器相同，防止被隐藏
        div > .bbc-tabs:nth-of-type(1) { display: none; } 隐藏 全部 想看 等标签
        .bbc-tabs:nth-of-type(3) { display: none; } 隐藏 动画 游戏 书籍标签
      */
      customEnabled: true,
      customLabel: 'Other'
    }),
    addonWaline({
      // Waline 配置项，参考 https://waline.js.org/reference/client/props.html
      serverURL: 'https://waline.mewhz.com',
    }), 
  ],

  themeConfig: {

    // type: 'strato',

    banner: {
      enable: true,
      title: '星星得不到爱火',
      cloud: {
        enable: true,
      },
    },

    bg_image : {
      enable: true,
      // url: 'http://pic.mewhz.com/img/bg2.jpeg',
      url: '/20240925002236.png',
      // opacity: 0.2,
    },

    colors: {
      primary: '#FF6A6A'
    },

    fireworks : {
      enable: true,
      colors: ["#F73859", "#14FFEC", "#00E0FF", "#FF99FE", "#FAF15D"],
    },

    pages: [
      {
        name: '小伙伴们',
        url: '/links/',
        icon: 'i-ri-links-line',
        color: 'dodgerblue'
      },
      {
        name: '追番列表',
        url: '/bangumi/',
        icon: 'i-ri-heart-2-line',
        color: 'hotpink',
      },
      {
        name: '笔记',
        url: 'https://notes.mewhz.com',
        icon: 'i-ri-book-marked-line',
        color: 'orange',
      }
    ],

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
        title: '关于',
        url: '/about/',
        icon: 'i-ri-clipboard-line',
      }
    },

  },

  vite: {
    optimizeDeps: {
      include: ['@waline/client/component'],
    },
  },

  unocss: { safelist },
})
