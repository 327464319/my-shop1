import Vue from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/global.css'
import './plugins/element.js'
import axios from 'axios'
import './assets/fonts/iconfont.css'
import moment from 'moment' // 导入模块
import removePath from './tools/removePath'
// 富文本
import VueQuillEditor from 'vue-quill-editor'

// 富文本require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 使用树状表格
import ZkTable from 'vue-table-with-tree-grid'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css' // 这个样式必须引入
// 使用富文本
Vue.use(VueQuillEditor /* { default global options } */)

Vue.use(ZkTable)
moment.locale('zh-cn') // 设置语言 或 moment.lang('zh-cn');
Vue.prototype.$moment = moment// 赋值使用
Vue.filter('dataFormat', (value, arg) => {
  return moment(value).format(arg)
})
Vue.prototype.$removePath = removePath

Vue.config.productionTip = false
Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://vue-shop-api.itheima.net/api/private/v1'
axios.interceptors.request.use(config => {
  NProgress.start()
  const token = window.sessionStorage.getItem('token')
  config.headers.Authorization = token
  return config
})
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
