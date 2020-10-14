import Vue from 'vue'
import { Pagination, Tooltip, TableColumn, Breadcrumb, Aside, Button, Col, Container, Form, FormItem, Header, Input, Main, Menu, MenuItem, MenuItemGroup, Message, Row, Submenu, BreadcrumbItem, Card, Table, Switch, Dialog, MessageBox, Tag, Tree, Select, Option } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Input)
Vue.use(Header)
Vue.use(Container)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Row)
Vue.use(Col)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
// Vue.use(MessageBox)
// 这个使用后每次刷新都会有message-box空白弹窗

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
