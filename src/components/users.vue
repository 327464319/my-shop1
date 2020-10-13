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
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="queryBtn">
              <el-button slot="append" icon="el-icon-search" @click="queryBtn"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogFormVisible = true">添加用户</el-button>
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
    <el-dialog title="添加用户" :visible.sync="dialogFormVisible" @close="resetDialog">
      <el-form :model="addForm" :rules="rules" ref="dialogForm">
        <el-form-item label="用户名" label-width="70px" prop="username">
          <el-input v-model="addForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" label-width="70px" prop="password">
          <el-input v-model="addForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" label-width="70px" prop="email">
          <el-input v-model="addForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机" label-width="70px" prop="mobile">
          <el-input v-model="addForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'users',
  data () {
    var checkemail = (rule, value, callback) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        return callback()
      }
      // 返回一个错误提示
      callback(new Error('请输入合法的邮箱'))
    }
    var checkiphone = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      // 返回一个错误提示
      callback(new Error('请输入合法的手机号码'))
    }
    return {
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },

      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],

        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkemail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkiphone, trigger: 'blur' }
        ]
      },
      dialogFormVisible: false,
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
    submitForm () {
      this.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.post('/users', this.addForm)

          if (res.meta.status !== 201) { this.$message.error(res.meta.msg) } else {
            this.dialogFormVisible = false
            this.$message.success(res.meta.msg)
            this.getUserList()
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetDialog () { this.$refs.dialogForm.resetFields() },
    getUserList: async function () {
      const { data: res } = await this.$http.get('/users', {
        params: this.queryInfo
      })

      this.userlist = res.data.users
      this.total = res.data.total
      // console.log(this.userlist)
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
