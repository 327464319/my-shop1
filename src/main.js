import Vue from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/global.css'
import './plugins/element.js'
import axios from 'axios'
import './assets/fonts/iconfont.css'

Vue.config.productionTip = false
Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://vue-shop-api.itheima.net/api/private/v1'
axios.interceptors.request.use(config => {
  const token = window.sessionStorage.getItem('token')
  config.headers.Authorization = token
  return config
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
