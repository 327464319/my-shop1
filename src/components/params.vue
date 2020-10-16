<template>
  <div id="app">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！" :closable="false" type="warning"></el-alert>
      <el-row style="margin-top:15px">
        <el-col :span="3">
          <span style="line-height: 38px">选择商品参数:</span>
        </el-col>
        <el-col :span="6">
          <el-cascader
            v-model="cataValue"
            :options="cataList"
            :props="cataProps"
            @change="cateHandleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            @click="dialogVisible = true"
            size="mini"
            :disabled="isDisabled"
          >添加参数</el-button>
        </el-tab-pane>
        <el-tab-pane label="静态参数" name="only">
          <el-button
            type="primary"
            @click="dialogVisible = true"
            size="mini"
            :disabled="isDisabled"
          >添加属性</el-button>
        </el-tab-pane>
      </el-tabs>
      <!-- 表格 -->
      <el-table :data="tableData" border stripe style="margin-top:10px;width: 100%">
        <el-table-column type="expand">
          <template #default="{row}">
            <el-tag
              :key="index"
              v-for="(tag,index) in row.attr_vals"
              closable
              :disable-transitions="false"
              @close="handleClose(row,index)"
            >{{tag}}</el-tag>
            <el-input
              class="input-new-tag"
              v-if="row.inputVisible"
              v-model="row.inputValue"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm(row)"
              @blur="handleInputConfirm(row)"
            ></el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ New Tag</el-button>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="attr_name" label="参数名称"></el-table-column>
        <el-table-column label="操作">
          <template #default="{row}">
            <!-- 修改 -->

            <el-tooltip class="item" effect="dark" content="修改" placement="top">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showDialogForm(row.cat_id,row.attr_id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除 -->

            <el-tooltip class="item" effect="dark" content="删除" placement="top">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="delParams(row.cat_id,row.attr_id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加模态框 -->
      <el-dialog
        :title="'添加'+dialogTitle"
        :visible.sync="dialogVisible"
        width="50%"
        @close="closeAddDialog"
      >
        <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="rules">
          <el-form-item :label="dialogTitle" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addDialogSubmit">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改模态框 -->
      <el-dialog
        :title="'修改'+dialogTitle"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="closeEditDialog"
      >
        <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="rules">
          <el-form-item :label="dialogTitle" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editDialogSubmit">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      tableData: [],
      rules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      },
      editForm: {},
      addForm: { attr_name: '' },
      dialogVisible: false,
      editDialogVisible: false,
      // tabs
      activeName: 'many',
      // 级联选择框参数
      cataList: [],
      cataValue: [],
      cataProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      }
    }
  },
  methods: {
    // tag添加与修改提交公用方法
    async submitTag (row) {
      const { data: res } = await this.$http.put(`categories/${row.cat_id}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      // 无论失败还是成功都得让数据更新，
      // 因为之前对row进行了改动，失败就得回调，
      // 成功了，别人也可能改了数据
      // this.getTableData()
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
    },

    // 表格tag删除
    handleClose (row, index) {
      row.attr_vals = row.attr_vals.filter((item, i) => { return i !== index })
      this.submitTag(row)
    },

    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleInputConfirm (row) {
      row.inputVisible = false
      if (row.inputValue.trim() === '') { return false }
      row.attr_vals.push(row.inputValue.trim())
      this.submitTag(row)
      row.inputValue = ''
    },
    // 编辑提交
    editDialogSubmit () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入参数！')

        const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getTableData()
        this.editDialogVisible = false
      })
    },
    // 删除参数
    delParams (catId, attrId) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${catId}/attributes/${attrId}`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getTableData()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 展示编辑
    async showDialogForm (catId, attrId) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`categories/${catId}/attributes/${attrId}`)
      if (res.meta.status !== 200) return false
      this.editForm = res.data
    },
    // tab数据获取
    async getTableData () {
      const id = this.cataValue[this.cataValue.length - 1]
      const { data: res } = await this.$http.get(`categories/${id}/attributes`, { params: { sel: this.activeName } })

      if (res.meta.status !== 200) return false
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      this.tableData = res.data
      // console.log('getTableData -> this.tableData', this.tableData)
    },
    // addDialog提交
    addDialogSubmit () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入参数！')
        const id = this.cataValue[this.cataValue.length - 1]
        const { data: res } = await this.$http.post(`categories/${id}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)

        this.$message.success(res.meta.msg)
        this.getTableData()
        this.dialogVisible = false
      })
    },
    // editdialog关闭
    closeEditDialog () { this.$refs.editFormRef.resetFields() },
    // adddia关闭
    closeAddDialog () {
      this.$refs.addFormRef.resetFields()
    },
    // tabs改变触发
    handleClick () {
      this.getTableData()
    },
    // 级联选择框改变触发
    cateHandleChange () {
      if (this.cataValue.length !== 3) {
        this.cataValue = []
        this.tableData = []
        return false
      }
      this.getTableData()
    },
    async getCateList () {
      // 获取商品分类数据
      const { data: res } = await this.$http.get('categories', {
        params: { type: 3 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      // 将数据列表赋值给cateList
      this.cataList = res.data
      // console.log(' this.cataList', res.data)
    }

  },
  computed: {
    isDisabled: function () {
      return this.cataValue.length === 0
    },
    dialogTitle: function () {
      return this.activeName === 'many' ? '动态参数' : '静态参数'
    }
  },
  created () {
    this.getCateList()
  }

}
</script>

<style lang="scss" scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
