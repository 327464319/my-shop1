<template>
  <div id="app">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="6">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            @keyup.enter.native="querySubmit"
            class="input-with-select"
            clearable
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="querySubmit"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table :data="ordersList" style="width: 100%">
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <template #default="{ row }">
            <el-tag type="danger" v-if="row.pay_status === '0'">未付款</el-tag>
            <el-tag v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column label="下单时间">
          <template #default="{ row }">{{
            row.add_time | dataFormat("YYYY-MM-DD hh:mm:ss")
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <!-- 修改 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="修改订单"
              placement="top"
            >
              <el-button
                type="info"
                icon="el-icon-edit"
                size="mini"
                @click="showbjDialog(row)"
              ></el-button>
            </el-tooltip>
            <!-- 添加地址 -->

            <el-tooltip
              class="item"
              effect="dark"
              content="添加地址"
              placement="top"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog"
              ></el-button>
            </el-tooltip>
            <!-- 物流 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="物流"
              placement="top"
            >
              <el-button
                type="success"
                icon="el-icon-location-information"
                size="mini"
                @click="showDialog(row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加地址 -->
    <el-dialog
      title="添加地址"
      :visible.sync="editDialogVisible"
      width="50%"
      ref="editDialogRef"
    >
      <el-form
        ref="editForm"
        :model="editForm"
        label-width="80px"
        :rules="addressRules"
      >
        <el-form-item label="省市区/县" prop="addressValue">
          <el-cascader
            v-model="editForm.addressValue"
            :options="citydata"
            @change="addressHandleChange"
            :props="{
              expandTrigger: 'hover',
              label: 'label',
              value: 'value',
              children: 'children',
            }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="location">
          <el-input v-model="editForm.location"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流 -->
    <el-dialog title="物流显示" :visible.sync="dialogVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(items, index) in physical"
          :key="index"
          :timestamp="items.time"
          >{{ items.context }}</el-timeline-item
        >
      </el-timeline>
    </el-dialog>
    <el-dialog title="编辑" :visible.sync="bjDialogVisible" width="50%">
      <el-form ref="bjformRef" :model="bjform" label-width="80px">
        <el-form-item label="订单编号">
          <el-input v-model="bjform.order_number" disabled></el-input>
        </el-form-item>
        <el-form-item label="订单价格">
          <el-input v-model.number="bjform.order_price"></el-input>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="bjform.pay_status" placeholder="请选择">
            <el-option
              v-for="item in zfoptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-select v-model="bjform.order_pay" placeholder="请选择">
            <el-option
              v-for="item in zffsoptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发货状态">
          <el-select v-model="bjform.is_send" placeholder="请选择">
            <el-option
              v-for="item in fhoptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="bjDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="bjSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import citydata from '../tools/citydata'
export default {
  data () {
    return {
      zfoptions: [{
        label: '已支付',
        value: '1'
      }, {
        label: '未支付',
        value: '0'
      }],
      zffsoptions: [{
        label: '未支付',
        value: '0'
      },
      {
        label: '支付宝',
        value: '1'
      }, {
        label: '微信',
        value: '2'
      },
      {
        label: '银行',
        value: '3'
      }],
      fhoptions: [{
        label: '是',
        value: '1'
      }, {
        label: '否',
        value: '0'
      }],
      bjform: {},
      physical: [],
      addressRules: {

        addressValue: [
          { required: true, message: '请输入省市区/县', trigger: 'blur' }

        ],
        location: [
          { required: true, message: '详细地址', trigger: 'blur' }

        ]
      },
      citydata,
      editForm: {
        addressValue: [],
        location: ''
      },
      bjDialogVisible: false,
      dialogVisible: false,
      editDialogVisible: false,
      ordersList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0
    }
  },
  created () { this.getOrdersList() },
  methods: {
    async showbjDialog (row) {
      this.bjDialogVisible = true
      // console.log(row.order_id)
      const { data: res } = await this.$http.get(`orders/${row.order_id}`)
      // console.log(res)
      if (res.meta.status !== 200) return false
      this.bjform = res.data
    },
    // 级联框改变触发
    addressHandleChange () {

    },
    async bjSubmit () {
      // console.log(this.bjform)
      const { data: res } = await this.$http.put('orders/' + this.bjform.order_id, this.bjform)
      console.log(res)
      if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.bjDialogVisible = false
      this.getOrdersList()
    },
    editDialogSubmit () { },
    showEditDialog () { this.editDialogVisible = true },
    async showDialog (row) {
      this.dialogVisible = true
      // console.log(row)
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) return this.$message.error('获取物流失败！')
      this.physical = res.data
    },
    querySubmit () {
      this.getOrdersList()
    },
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getOrdersList()
    },
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getOrdersList()
    },
    async getOrdersList () {
      const { data: res } = await this.$http.get('/orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return res.$message(res.meta.msg)
      // console.log(res)
      this.ordersList = res.data.goods
      this.total = res.data.total
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
