<template>
  <div id="app">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="8">
          <div style="margin: 15px 0 15px 0;">
            <el-input
              placeholder="请输入内容"
              v-model="queryInfo.query"
              @keyup.enter.native="queryWithQuery"
            >
              <el-button slot="append" icon="el-icon-search" @click="queryWithQuery"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" style="margin: 15px 0 0 10px;" @click="goGoodsAdd">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格展示数据 -->
      <template>
        <el-table :data="goodsList" style="width: 100%" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="goods_name" label="商品名称" width="680"></el-table-column>
          <el-table-column prop="goods_price" label="商品价格"></el-table-column>
          <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
          <el-table-column label="创建时间" width="160">
            <template #default="{row}">{{row.add_time|dataFormat('YYYY-MM-DD hh:mm:ss')}}</template>
          </el-table-column>
          <el-table-column label="操作" width="140">
            <template #default="{row}">
              <!-- 修改 -->

              <el-tooltip class="item" effect="dark" content="修改" placement="top">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(row.goods_id)"
                ></el-button>
              </el-tooltip>
              <!-- 删除 -->
              <el-tooltip class="item" effect="dark" content="删除" placement="top">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delGood(row.goods_id)"
                ></el-button>
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
        :page-sizes="[2, 5, 10, 16]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 修改idalog -->
      <el-dialog title="修改商品" :visible.sync="addDialogVisible" width="50%" @close="editDialogClose">
        <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="110px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格(元)" prop="goods_price">
            <el-input v-model.number="editForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model.number="editForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model.number="editForm.goods_number"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editSubmit">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    var validatePrice = (rule, value, callback) => {
      if (value === 0) { return callback(new Error('价格0元？您是慈善家吗？')) } else { callback() }
    }
    return { // 编辑
      editRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [{ type: 'number', required: true, message: '请输入数值', trigger: 'blur' }, { validator: validatePrice, trigger: 'blur' }],
        goods_number: [{ type: 'number', required: true, message: '请输入数值', trigger: 'blur' }],
        goods_weight: [{ type: 'number', required: true, message: '请输入数值', trigger: 'blur' }]
      },
      editForm: {
        // goods_name: '',
        // goods_price: 0,
        // goods_number: 0,
        // goods_weight: 0
      },
      addDialogVisible: false,
      // 商品参数
      goodsList: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      }
    }
  },

  methods: {
    goGoodsAdd () { this.$router.push('/goods/add') },
    // 关闭清空验证
    editDialogClose () { this.$refs.editFormRef.resetFields() },
    // 编辑提交
    editSubmit () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入正确数据！')
        const { data: res } = await this.$http.put(`/goods/${this.editForm.goods_id}`, {
          goods_name: this.editForm.goods_name,
          goods_price: this.editForm.goods_price,
          goods_weight: this.editForm.goods_weight,
          goods_number: this.editForm.goods_number,
          goods_cat: this.editForm.goods_cat
        })

        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
          return false
        }
        this.$message.success('修改数据成功！')
        this.getGoodsList()
        this.addDialogVisible = false
        return true
      })
    },
    // 展示编辑dialog
    async showEditDialog (id) {
      this.addDialogVisible = true
      const { data: res } = await this.$http.get(`goods/${id}`)

      if (res.meta.status !== 200) return false
      this.editForm = res.data
    },
    // 删除商品
    delGood (id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getGoodsList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 搜索
    queryWithQuery () {
      this.getGoodsList()
      console.log(this.goodsList)
    },
    // 分页方法
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getGoodsList()
    },
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getGoodsList()
    },
    async getGoodsList () {
      const { data: res } = await this.$http.get('/goods', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      // 将数据列表赋值给cateList
      this.goodsList = res.data.goods
      // 保存总数据条数
      this.total = res.data.total
    }
  },

  created () { this.getGoodsList() }

}
</script>

<style lang="scss" scoped>
</style>
