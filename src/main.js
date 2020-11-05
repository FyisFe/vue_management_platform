import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
import axios from 'axios'

Vue.config.productionTip = false
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
Vue.filter('dateFormat', function (originVal) {
  const dataTime = new Date(originVal)
  const year = dataTime.getFullYear()
  const month = (dataTime.getMonth() + 1 + '').padStart(2, '0')
  const day = (dataTime.getDate() + '').padStart(2, '0')
  const hour = (dataTime.getHours() + '').padStart(2, '0')
  const minute = (dataTime.getMinutes() + '').padStart(2, '0')
  const second = (dataTime.getSeconds() + '').padStart(2, '0')
  return `${year}-${month}-${day}-${hour}-${minute}-${second}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
