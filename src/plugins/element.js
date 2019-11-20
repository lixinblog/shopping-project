import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'
// Message 是导入弹框提示组件

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message
