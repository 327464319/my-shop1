<template>
  <div id="app">
    <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
        <div>
          <!-- 黑马logo -->
          <img src="../assets/heima.png" alt />
          <!-- 顶部标题 -->
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- 页面主体区域 -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapase?'64px':'200px'">
          <el-menu
            :default-active="defaultActive"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
            background-color="#333744"
            text-color="#fff"
            active-text-color="#409EFF"
            unique-opened
            :collapse="isCollapase"
            :collapse-transition="false"
            router
          >
            <div class="toggle-button" @click="toggelButton">|||</div>
            <!-- 一级组件 -->
            <el-submenu :index="' '+item.id" v-for="item in homeList" :key="item.id">
              <template slot="title">
                <i :class="iconsObj[item.id]"></i>
                <span>{{item.authName}}</span>
              </template>
              <!-- 二级组件 -->
              <el-menu-item
                :index="'/'+subitem.path"
                v-for="subitem in item.children"
                :key="subitem.id"
                @click="setDefaultActive(subitem.path)"
              >
                <i class="el-icon-menu"></i>
                <span>{{subitem.authName}}</span>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 主体结构 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data () {
    return {
      homeList: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapase: false,
      defaultActive: ''
    }
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    handleOpen (key, keyPath) {
      // console.log(key, keyPath)
    },
    handleClose (key, keyPath) {
      // console.log(key, keyPath)
    },
    async getHomeList () {
      const { data: res } = await this.$http.get('/menus')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.homeList = res.data
    },
    toggelButton () {
      this.isCollapase = !this.isCollapase
    },
    setDefaultActive (path) {
      const abpath = '/' + path
      window.sessionStorage.setItem('path', abpath)
    }
  },
  mounted () {
    this.getHomeList()
    const path = window.sessionStorage.getItem('path')
    this.defaultActive = path
  }

}
</script>

<style lang="scss" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  color: #ffffff;
  font-size: 20px;
  align-items: center;
  div {
    img {
      vertical-align: middle;
      margin-right: 10px;
    }
  }
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.el-menu {
  border-right: 0px;
}
.iconfont {
  padding-right: 10px;
}
.toggle-button {
  background: #4a5064;
  text-align: center;
  color: #ffffff;
  letter-spacing: 2px;
  font-size: 10px;
  line-height: 24px;
}
</style>
