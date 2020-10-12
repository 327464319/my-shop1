<template>
  <div id="app">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 输入框 -->

      <el-row :gutter="20">
        <el-col :span="8">
          <div>
            <el-input placeholder="请输入内容" v-model="queryInfo.query">
              <el-button slot="append" icon="el-icon-search" @click="queryBtn"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>

      <template>
        <el-table :data="userlist" style="width: 100%" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="username" label="姓名" width="180"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="电话" prop="mobile"></el-table-column>
          <el-table-column label="角色" prop="role_name"></el-table-column>
          <el-table-column label="状态">
            <template #default="{row}">
              <el-switch v-model="row.mg_state" @change="switchEl(row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180px">
            <template>
              <!-- 修改 -->

              <el-tooltip class="item" effect="dark" content="修改" placement="top">
                <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
              </el-tooltip>
              <!-- 删除 -->

              <el-tooltip class="item" effect="dark" content="删除" placement="top">
                <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
              </el-tooltip>
              <!-- 分配角色 -->
              <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
                <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 4, 8, 16]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'users',
  data () {
    return {

      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      total: 0
    }
  },
  methods: {
    getUserList: async function () {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryInfo
      })

      this.userlist = res.data.users
      this.total = res.data.total
      console.log(this.userlist)
    },
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    async switchEl (row) {
      const { data: res } = await this.$http.put(`users/${row.id}/state/${row.mg_state}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
    },
    queryBtn () {
      this.getUserList()
    }
  },
  created () {
    this.getUserList()
  }

}
</script>

<style lang="scss" scoped>
.el-card {
  margin-top: 10px;
}
.text {
  font-size: 14px;
}

.item {
  padding: 18px 0;
}
.el-table {
  margin-top: 10px;
}
.el-tooltip {
  display: inline-block;
  padding: 0;
  width: 44px;
  height: 28px;
}
</style>
