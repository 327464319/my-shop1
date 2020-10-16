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
          <div style="margin-top: 15px;">
            <el-input placeholder="请输入内容">
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" style="margin: 15px 0 0 10px;">添加用户</el-button>
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
                  @click="editDialogForm(row.id)"
                ></el-button>
              </el-tooltip>
              <!-- 删除 -->
              <el-tooltip class="item" effect="dark" content="删除" placement="top">
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="open(row.id)"></el-button>
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
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品参数
      goodsList: [],
      total: 0,
      queryInfo: {
        pagenum: 1,
        pagesize: 10
      }
    }
  },
  methods: {
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
