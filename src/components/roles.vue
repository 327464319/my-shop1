<template>
  <div id="app">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- 面包屑导航 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-button class="md" type="primary" @click="dialogFormVisible=true">添加用户</el-button>
      <template>
        <el-table :data="rolesList" style="width: 100%" border stripe>
          <el-table-column type="expand">
            <template v-slot="{row}">
              <!-- 一级菜单 -->
              <el-row
                v-for="(item,index) in row.children"
                :key="item.id"
                :class="['vbottom','flex',index==0?'vtop':'']"
              >
                <el-col :span="5">
                  <el-tag closable @close="closeTag(row,item.id)">{{item.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 二级菜单 -->
                <el-col :span="19">
                  <el-row
                    v-for="(item2,index) in item.children"
                    :key="item2.id"
                    :class="[index==0?'':'vtop','flex']"
                  >
                    <el-col :span="6">
                      <el-tag
                        type="success"
                        closable
                        @close="closeTag(row,item2.id)"
                      >{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 三级菜单 -->
                    <el-col :span="18">
                      <el-tag
                        type="warning"
                        v-for="item3 in item2.children"
                        :key="item3.id"
                        closable
                        @close="closeTag(row,item3.id)"
                      >{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="roleName" label="角色名称" width="180"></el-table-column>
          <el-table-column prop="roleDesc" label="角色描述" width="180"></el-table-column>
          <el-table-column label="操作">
            <template #default="{row}">
              <!-- 修改 -->

              <el-tooltip class="item" effect="dark" content="修改" placement="top">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="editDialogForm(row.id)"
                ></el-button>
              </el-tooltip>
              <!-- 删除 -->

              <el-tooltip class="item" effect="dark" content="删除" placement="top">
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="open(row.id)"></el-button>
              </el-tooltip>
              <!-- 分配角色 -->
              <el-tooltip class="item" effect="dark" content="分配权限" placement="top">
                <el-button
                  type="warning"
                  icon="el-icon-setting"
                  size="mini"
                  @click="showRoles(row)"
                ></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 分配角色dialog -->
      <el-dialog title="分配权限" :visible.sync="dialogVisible" width="50%" @close="closeDialog">
        <el-tree
          ref="treeRef"
          :data="rolesTree"
          :props="defaultProps"
          @node-click="handleNodeClick"
          node-key="id"
          default-expand-all
          show-checkbox
          :default-checked-keys="nodesChecked"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="treeSet">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 添加 -->
      <el-dialog class="mb" title="添加用户" :visible.sync="dialogFormVisible" @close="resetDialog">
        <el-form :model="roleForm" :rules="rules" ref="dialogForm">
          <el-form-item label="角色名称" label-width="80px" prop="roleName">
            <el-input v-model="roleForm.roleName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" label-width="80px" prop="roleDesc">
            <el-input v-model="roleForm.roleDesc" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </el-dialog>
      <!-- 修改 -->
      <el-dialog title="修改角色" :visible.sync="editDialogFormVisible" @close="editResetDialog">
        <el-form :model="editForm" :rules="rules" ref="editDialogForm">
          <el-form-item label="角色名" label-width="70px">
            <el-input v-model="editForm.roleName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="描述" label-width="70px" prop="email">
            <el-input v-model="editForm.roleDesc" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editDialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="editSubmitForm">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 当前选中的权限树的角色id
      setTreeId: 0,
      // 默认选中的节点
      nodesChecked: [],
      // 编辑数据
      editForm: {

      },
      // 添加用户的表单数据
      roleForm: {
        roleName: '',
        roleDesc: ''
      },

      rules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }

        ],
        roleDesc: [

          { min: 0, max: 50, message: '长度在 0 到 50个字符', trigger: 'blur' }
        ]

      },
      // 编辑
      editDialogFormVisible: false,
      // 添加
      dialogFormVisible: false,
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      rolesTree: [],
      rolesList: [],
      dialogVisible: false
    }
  },
  methods: {
    // 设置权限
    async treeSet () {
      const refArr = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      console.log(refArr)
      const rids = refArr.join(',')

      // setTreeId
      const { data: res } = await this.$http.post(`roles/${this.setTreeId}/rights`, { rids })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getRoleList()
      this.dialogVisible = false
    },
    // 关闭dialog清除数组数据
    closeDialog () {
      this.nodesChecked = []
    },
    // 编辑提交
    editSubmitForm () {
      this.$refs.editDialogForm.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, this.editForm)
          // console.log(res)
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.editDialogFormVisible = false
          this.getRoleList()
          this.$message.success('更新成功！')
        } else {
          this.$message.error('请输入正确信息！')
        }
      })
    },
    // 编辑重置
    editResetDialog () {
      this.$refs.editDialogForm.resetFields()
    },
    // 编辑用户展示
    async editDialogForm (id) {
      this.editDialogFormVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      this.editForm = res.data
      // console.log(res.data)
    },
    // 提交
    submitForm () {
      this.$refs.dialogForm.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.post('/roles', this.roleForm)

          if (res.meta.status !== 201) { this.$message.error(res.meta.msg) } else {
            this.dialogFormVisible = false
            this.$message.success(res.meta.msg)
            this.getRoleList()
          }
        } else {
          this.$message.error('请填写完整用户信息')
          return false
        }
      })
    },
    // 重置添加
    resetDialog () { this.$refs.dialogForm.resetFields() },
    // 删除确认
    open (id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete('/roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message({
            type: 'info',
            message: '删除失败！'
          })
        }

        this.getRoleList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch((e) => {
        // console.log(e)
        this.$message({
          type: 'info',
          message: '已取消删除！'
        })
      })
    },
    // 节点点击回调
    handleNodeClick () { },
    // 设置权限
    showRoles (row) {
      this.dialogVisible = true

      this.setTreeId = row.id
      this.getThreeChild(row, this.nodesChecked)
      this.getRoleTree()
    },
    //
    getThreeChild (row, arr) {
      if (!row.children) {
        arr.push(row.id)
      } else { row.children.forEach((item) => { this.getThreeChild(item, arr) }) }
    },

    // 删除权限
    closeTag (row, id) {
      // console.log(row)
      // console.log(id)
      this.$confirm('删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${row.id}/rights/${id}`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        console.log(row)
        row.children = res.data
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    async getRoleTree () {
      const { data: res } = await this.$http.get('rights/tree')
      // 如果返回状态为异常状态则报错并返回
      // if (res.meta.status !== 200)
      //     return this.$message.error('获取角色列表失败')
      // 如果返回状态正常，将请求的数据保存在data中
      // this.rolesList = res.data
      // console.log(res.data)
      this.rolesTree = res.data
    },
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      // 如果返回状态为异常状态则报错并返回
      // if (res.meta.status !== 200)
      //     return this.$message.error('获取角色列表失败')
      // 如果返回状态正常，将请求的数据保存在data中
      // this.rolesList = res.data
      // console.log(res.data)
      this.rolesList = res.data
    }
  },

  created () {
    this.getRoleList()
  }

}
</script>

<style lang="scss" scoped>
.vbottom {
  border-bottom: 1px solid #eeeeee;
}
.vtop {
  border-top: 1px solid #eeeeee;
}
.vbottom2 {
  border-bottom: 0;
}
.flex {
  display: flex;
  align-items: center;
}
.md {
  margin-bottom: 5px;
}
</style>
