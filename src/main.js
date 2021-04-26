import { Button, Table, Upload } from 'ant-design-vue'
import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

const app = createApp(App);
app.use(Button).use(Upload).use(Table)
app.use(store).use(router);
app.mount('#app');
