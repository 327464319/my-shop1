<template>
  <div id="app">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 面包屑导航 -->
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <template>
        <el-table :data="rightsList" style="width: 100%" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="authName" label="权限名称" width="180"></el-table-column>
          <el-table-column prop="path" label="路径" width="180"></el-table-column>
          <el-table-column prop="level" label="权限等级">
            <template v-slot="{row}">
              <el-tag type="success" v-if="row.level==0">一级权限</el-tag>
              <el-tag type="info" v-if="row.level==1">二级权限</el-tag>
              <el-tag type="warning" v-if="row.level==2">三级权限</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rightsList: []
    }
  },
  methods: {
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      // 如果返回状态为异常状态则报错并返回
      // console.log(res)
      if (res.meta.status !== 200) { return this.$message.error('获取权限列表失败') }
      // 如果返回状态正常，将请求的数据保存在data中
      this.rightsList = res.data
    }
  },
  created () {
    this.getRightsList()
  }

}
</script>

<style lang="scss" scoped>
</style>
