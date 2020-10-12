<template>
  <div class="login_contain">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 表单区域 -->
      <el-form class="el-form" :rules="rules" :model="form" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="form.password"
            type="password"
            @keyup.enter.native="login"
          ></el-input>
        </el-form-item>
        <el-form-item class="btn">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
      form: {
        username: 'admin',
        password: '123456'
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在 6到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/login', this.form)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }

}
</script>

<style lang="scss" scoped>
.login_contain {
  background: #2b4b6b;
  height: 100%;
  position: relative;
}
.login_box {
  width: 450px;
  height: 300px;
  background: #ffffff;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  width: 130px;
  height: 130px;
  padding: 10px;
  box-shadow: 0 0 10px #dddddd;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, -50%);
  background: #ffffff;
  img {
    width: 100%;
    border-radius: 50%;
    background: #eeeeee;
  }
}
.btn {
  display: flex;
  justify-content: flex-end;
}
.el-form {
  position: absolute;
  bottom: 0;
  box-sizing: border-box;
  padding: 0 20px;
  width: 100%;
}
</style>
