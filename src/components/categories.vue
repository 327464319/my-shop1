<template>
  <div id="app">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-button type="primary" style="margin-bottom:15px" @click="showAddDialog">添加分类</el-button>
      <zk-table
        ref="table"
        sum-text="sum"
        index-text="#"
        :data="catagoriesList"
        :columns="columns"
        :stripe="props.stripe"
        :border="props.border"
        :show-header="props.showHeader"
        :show-summary="props.showSummary"
        :show-row-hover="props.showRowHover"
        :show-index="props.showIndex"
        :tree-type="props.treeType"
        :is-fold="props.isFold"
        :expand-type="props.expandType"
        :selection-type="props.selectionType"
      >
        <template #isdel="{row}">
          <i class="el-icon-success" style="color:green" v-if="row.cat_deleted===false"></i>
          <i class="el-icon-error" style="color:red" v-if="row.cat_deleted===true"></i>
        </template>
        <template #score="{row}">
          <el-tag v-if="row.cat_level===0">一级</el-tag>
          <el-tag type="info" v-if="row.cat_level===1">二级</el-tag>
          <el-tag type="danger" v-if="row.cat_level===2">三级</el-tag>
        </template>
        <template #caozuo="{row}">
          <!-- 修改 -->

          <el-tooltip class="item" effect="dark" content="修改" placement="top">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(row.cat_id)"
            ></el-button>
          </el-tooltip>
          <!-- 删除 -->

          <el-tooltip class="item" effect="dark" content="删除" placement="top">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="del(row.cat_id)"></el-button>
          </el-tooltip>
        </template>
      </zk-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageInfo.pagenum"
        :page-sizes="[2, 5, 10, 16]"
        :page-size="pageInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 添加的dailog -->
      <el-dialog title="商品分类" :visible.sync="addDialogVisible" width="50%" @close="closeAddDialog">
        <el-form :model="addForm" :rules="rules" ref="addDialogRef">
          <el-form-item label="分类名称" label-width="80px" prop="cat_name">
            <el-input v-model="addForm.cat_name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="分类列表" label-width="80px">
            <el-cascader
              v-model="cascaderValue"
              :options="cascaderOptions"
              :props="cascaderProps"
              @change="cascaderChange"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="cascaderSubmit">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑对话框 -->
      <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%">
        <el-form :model="editForm" :rules="rules" ref="editDialogRef">
          <el-form-item label="分类名称" label-width="80px" prop="cat_name">
            <el-input v-model="editForm.cat_name" autocomplete="off"></el-input>
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
      // 编辑模态框状态
      editDialogVisible: false,
      // 编辑数据
      editForm: {
        cat_name: '',
        cat_id: 0
      },
      // cascadr级联参数
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      cascaderValue: [],
      cascaderOptions: [],
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 商品分类dialog数据
      addForm: { // 分类名称
        cat_name: '',
        // 添加分类的父级id，0则表示父级为0.添加一级分类
        cat_pid: 0,
        // 添加分类的等级，0则表示添加一级分类
        cat_level: 0
      },
      addDialogVisible: false,
      total: 0,
      pageInfo: { type: 3, pagenum: 1, pagesize: 5 },
      catagoriesList: [],
      props: {
        stripe: false,
        border: true,
        showHeader: true,
        showSummary: false,
        showRowHover: true,
        showIndex: true,
        treeType: true,
        isFold: true,
        expandType: false,
        selectionType: false
      },

      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          width: '400px'
        },
        {
          label: '是否有效',
          minWidth: '50px',
          type: 'template',
          template: 'isdel'

        },
        {
          label: '排序',
          type: 'template',
          template: 'score'
        },
        {
          label: '操作',
          minWidth: '200px',
          type: 'template',
          template: 'caozuo'
        }
      ]
    }
  },
  methods: {
    // 编辑提交
    editDialogSubmit () {
      this.$refs.editDialogRef.validate(async valid => {
        if (!valid) { this.$message.error('请填写完整用户信息') } else {
          const { data: res } = await this.$http.put('/categories/' + this.editForm.cat_id, this.editForm)

          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          this.getCateList()
          this.editDialogVisible = false
        }
      })
    },
    // 展示编辑表单
    async showEditDialog (id) {
      // console.log(id)
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('/categories/' + id)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      this.editForm.cat_name = res.data.cat_name
      this.editForm.cat_id = id
    },
    // 删除
    del (id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // console.log(id)
        this.getCateList().then((obj) => {
          // console.log(obj)
          if (obj.length === 1) {
            this.pageInfo.pagenum--
          }
        })
        const { data: res } = await this.$http.delete('/categories/' + id)
        // console.log(res)

        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getCateList()
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
    // 关闭添加的模态框
    closeAddDialog () {
      this.$refs.addDialogRef.resetFields()
      this.cascaderValue = []
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
    },
    cascaderSubmit () {
      this.$refs.addDialogRef.validate(async valid => {
        if (!valid) { this.$message.error('请填写完整用户信息') } else {
          const { data: res } = await this.$http.post('categories', this.addForm)
          if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          this.getCateList()
          this.addDialogVisible = false
        }
      })
    },
    async getAddDialogOption () {
      // 获取商品分类数据
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      // 将数据列表赋值给cateList
      this.cascaderOptions = res.data
      // console.log(this.cascaderOptions)
    },
    // 展示添加分类
    showAddDialog () {
      this.addDialogVisible = true
      this.getAddDialogOption()
    },
    // 级联选择框
    cascaderChange () { // console.log(this.cascaderValue)
      if (this.cascaderValue.length === 2) {
        this.addForm.cat_pid = this.cascaderValue[this.cascaderValue.length - 1]
        this.addForm.cat_level = 2
      } else {
        this.addForm.cat_level = 1
        this.addForm.cat_pid = this.cascaderValue[0]
      }
      // console.log('cascaderChange ->  this.addForm.cat_pid', this.addForm)
    },
    // 分页方法
    handleSizeChange (val) {
      this.pageInfo.pagesize = val
      this.getCateList()
    },
    handleCurrentChange (val) {
      this.pageInfo.pagenum = val
      this.getCateList()
    },
    async getCateList () {
      // 获取商品分类数据
      const { data: res } = await this.$http.get('categories', {
        params: this.pageInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      // 将数据列表赋值给cateList
      this.catagoriesList = res.data.result

      // 保存总数据条数
      this.total = res.data.total
      // console.log(res.data)
      return res.data.result
    }
  },
  created () {
    this.getCateList()
  }
}
</script>

<style lang="scss" scoped>
.el-cascader {
  width: 100%;
}
</style>
