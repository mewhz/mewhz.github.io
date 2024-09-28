import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({


  url: 'https://mewhz.com/',
  lang: 'zh-CN',
  // 标题
  title: '星星得不到爱火',
  author: {
    // 名称
    name: '星落',
    // 头像
    avatar: 'https://avatars.githubusercontent.com/u/48837161',
    // 状态
    status: {
      emoji: '✨',
      message: '开开心心~'
    }
  },
  // 副标题
  subtitle: '',
  // 主标题
  description: '从前从前有个人爱你很久',
  // 站点图标
  favicon: 'https://pic.mewhz.com/img/favicon.ico',
  // 社交图标
  social: [
    {
      name: '哔哩哔哩',
      link: 'https://space.bilibili.com/4767208',
      icon: 'i-ri-bilibili-line',
      color: '#FF8EB3',
    },
    {
      name: 'GitHub',
      link: 'https://github.com/mewhz',
      icon: 'i-ri-github-line',
      color: 'rgb(142, 113, 193);',
    },
    {
      // 名称
      name: 'E-Mail',
      // 链接
      link: 'mailto:mewhz@qq.com',
      // 图标
      icon: 'i-ri-mail-line',
      // 颜色
      color: '#0088CC',
    },
  ],
  // 开启阅读统计
  statistics: {
    enable: true,
    readTime: {
      // 阅读速度
      speed: {
        cn: 300,
        en: 200,
      },
    },
  },
  search: {
    enable: true,
    // 设置类型为 Fuse
    type: 'fuse',
  },
  // 放大图片
  mediumZoom: {
    enable: true
  },
  // 赞助
  sponsor: {
    enable: false,
  },
  
  // 开启评论
  comment: {
    enable: true
  },
  
})
