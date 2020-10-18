<template>
  <div id="app">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon></el-alert>

      <el-steps :space="200" :active="activeName-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form label-position="top" ref="formRef" :rules="Rules" :model="form" label-width="80px">
        <el-tabs
          tab-position="left"
          v-model="activeName"
          :before-leave="tabsToggle"
          @tab-click="tabsClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="form.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="form.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_number">
              <el-input v-model.number="form.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_weight">
              <el-input v-model.number="form.goods_weight"></el-input>
            </el-form-item>
            <el-form-item>
              <el-cascader
                v-model="cascaValue"
                :options="cascaOptions"
                :props="cascaProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyParamsList"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  border
                  :label="v"
                  v-for="(v,i) in item.attr_vals"
                  :key="v+i"
                  @change="check(item.attr_vals)"
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyParamsList"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :headers="headers"
              class="upload-demo"
              :action="urlPath"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSucess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <el-form-item>
              <quill-editor v-model="form.goods_introduce" @change="onEditorChange($event)"></quill-editor>
            </el-form-item>
            <el-button @click="goodSubmit">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <el-dialog title="图片预览" :visible.sync="picDialogVisible" width="50%">
        <img :src="imgSrc" />
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
    return {
      imgSrc: '',
      picDialogVisible: false,
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      urlPath: 'http://vue-shop-api.itheima.net/api/private/v1/upload',
      onlyParamsList: [],
      manyParamsList: [],
      cascaProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      cascaValue: [],
      cascaOptions: [],
      activeName: '0',
      Rules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [{ type: 'number', required: true, message: '请输入数值', trigger: 'blur' }, { validator: validatePrice, trigger: 'blur' }],
        goods_number: [{ type: 'number', required: true, message: '请输入数值', trigger: 'blur' }],
        goods_weight: [{ type: 'number', required: true, message: '请输入数值', trigger: 'blur' }]
      },
      form: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        pics: [],
        // 我还没有处理这里goods_cat
        goods_cat: '',
        goods_introduce: '',
        attrs: []

      }
    }
  },
  methods: {
    goodSubmit () {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return this.$message.error('验证失败！')
        this.form.goods_cat = [...this.cascaValue].join(',')

        // console.log(this.manyParamsList)
        /// console.log(this.onlyParamsList)
        this.manyParamsList.forEach(item => {
          this.form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          })
        })
        this.onlyParamsList.forEach(item => {
          this.form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          })
        })
        // console.log(this.form)
        const { data: res } = await this.$http.post('/goods', this.form)

        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.form = {}
        this.$router.push('/goods')
      })
    },
    // 富文本change事件
    onEditorChange (event) {
      // console.log(event)
      // console.log(this.form)
    },
    handleSucess (response, file, fileList) {
      if (response.meta.status === 200) {
        this.form.pics.push({ pic: response.data.tmp_path })
      }
    },
    handlePreview (file) {
      this.picDialogVisible = true
      this.imgSrc = file.url
    },
    handleRemove (file) {
      const delPath = file.response.data.tmp_path

      this.form.pics = this.form.pics.filter((item) => {
        return item.pic !== delPath
      })
    },
    // checkbox change事件
    check (row) { // console.log(row)
    },
    // tabs点击时触发
    tabsClick () {
      if (this.activeName === '1') {
        this.getManyParams('many', 'manyParamsList')
      } else if (this.activeName === '2') {
        this.getManyParams('only', 'onlyParamsList')
      }
    },
    async getManyParams (sel, type) {
      const { data: res } = await this.$http.get(`categories/${this.paramsId}/attributes`, {
        params: {
          sel
        }
      })

      if (res.meta.status !== 200) return false
      if (sel === 'many') {
        res.data.forEach((item) => {
          if (item.attr_vals !== '') {
            item.attr_vals = item.attr_vals.split(' ')
          } else { item.attr_vals = [] }
        })
      }
      // hhh奇怪不？
      this[type] = res.data
    },
    tabsToggle (activeName, oldActiveName) {
      if (this.cascaValue.length !== 3) {
        this.$message.error('请选择参数！')
        return false
      }
    },

    // casca
    handleChange () {
      this.cascaValue = this.cascaValue.length === 3 ? this.cascaValue : []
    },
    async getCateList () {
      // 获取商品分类数据
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      // 将数据列表赋值给cateList

      this.cascaOptions = res.data

      // 保存总数据条数
      this.total = res.data.total
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    paramsId: function () {
      return this.cascaValue.length !== 3 ? '' : this.cascaValue[2] - 0
    }
  }

}
</script>

<style lang="scss" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
img {
  width: 722px;
}
</style>
