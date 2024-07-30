import Vue from 'vue'
import App from './App.vue'
import wx from 'weixin-js-sdk'
Vue.prototype.$wx = wx
Vue.config.productionTip = false
Vue.use(wx)
new Vue({
  render: h => h(App),
}).$mount('#app')
