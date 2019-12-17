<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索与添加区 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList()">
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList()"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table
        :data="userlist"
        border
        stripe
      >
        <el-table-column type="index"></el-table-column>
        <el-table-column
          label="姓名"
          prop="username"
        ></el-table-column>
        <el-table-column
          label="邮箱"
          prop="email"
        ></el-table-column>
        <el-table-column
          label="电话"
          prop="mobile"
        ></el-table-column>
        <el-table-column
          label="角色"
          prop="role_name"
        ></el-table-column>
        <el-table-column
          label="状态"
          prop="mg_state"
        >
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180px"
        >
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserbyid(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warring" icon="el-icon-setting" size="mini" @click="setrole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 3, 4]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
  title="添加用户"
  :visible.sync="addDialogVisible"
  width="50%" @close="addDialogClosed">
  <!-- 内容主体区 -->
  <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="70px">
  <el-form-item label="用户名" prop="username">
    <el-input v-model="addForm.username"></el-input>
  </el-form-item>
   <el-form-item label="密码" prop="password">
    <el-input v-model="addForm.password"></el-input>
  </el-form-item>
   <el-form-item label="邮箱" prop="email">
    <el-input v-model="addForm.email"></el-input>
  </el-form-item>
   <el-form-item label="电话" prop="mobile">
    <el-input v-model="addForm.mobile"></el-input>
  </el-form-item>
  </el-form>
  <!-- 底部区 -->
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
</el-dialog>
<!-- 修改用户的对话框 -->
<el-dialog
  title="修改用户"
  :visible.sync="EditdialogVisible"
  width="50%"
  @close="editDialogclose"
  >
  <el-form :model="editForm" :rules="editFormrules" ref="editFormref" label-width="70px">
  <el-form-item label="用户名">
    <el-input v-model="editForm.username" disabled></el-input>
  </el-form-item>
  <el-form-item label="邮箱" prop="email">
    <el-input v-model="editForm.email"></el-input>
  </el-form-item>
  <el-form-item label="手机" prop="mobile">
    <el-input v-model="editForm.mobile"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="EditdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="EdituserInfo">确 定</el-button>
  </span>
</el-dialog>
<!-- 分配角色对话框 -->
<el-dialog
  title="分配角色"
  :visible.sync="setroledialogVisible"
  width="30%"
  @close="setroledialogclosed"
  >
  <div>
    <p>当前的用户:{{UserInfo.username}}</p>
    <p>当前的角色:{{UserInfo.role_name}}</p>
    <p>分配新角色:
      <el-select v-model="selectedroleid" placeholder="请选择">
    <el-option
      v-for="item in rolelist"
      :key="item.id"
      :label="item.roleName"
      :value="item.id">
    </el-option>
  </el-select>
    </p>
  </div>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setroledialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveroleinfo">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则（注意后面没有逗号）
   var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // // 验证手机号的规则
    // var checkMobile = (rule, value, cb) => {
    //   // 验证手机号的正则表达式
    //   const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
    //   if (regMobile.test(value)) {
    //     // 合法的手机号
    //     return cb()
    //   }
    //   cb(new Error('请输入合法的手机号'))
    // }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据 
        pagesize: 2
      },
      userlist: [],
      // 所有角色的数据列表
      rolelist: [],
      total: 0,
      // 添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 修改用户对话框的显示与隐藏
      EditdialogVisible: false,
      // 分配角色对话框的显示与隐藏
      setroledialogVisible: false,
      //  需要被分配角色的信息
      UserInfo: {},
      // 查询到的信息用户对象
      editForm: {},
      // 已选中的角色id值
      selectedroleid: '',
      // 编辑表单数据的规则对象
      editFormrules: {
        email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' }, 
        { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }, 
        { validator: checkEmail, trigger: 'blur' }
      ],
      mobile: [
        { required: true, message: '请输入电话', trigger: 'blur' }, 
        { min: 3, max: 11, message: '长度在 3 到 11 个字符', trigger: 'blur' },
        // { validator: checkMobile, trigger: 'blur' }
      ]
      },
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单数据的规则对象
      addFormrules: {
      // 用户名的验证规则
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }, 
        { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
      ],
       password: [
        { required: true, message: '请输入密码', trigger: 'blur' }, 
        { min: 3, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
      ],
      email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' }, 
        { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }, 
        { validator: checkEmail, trigger: 'blur' }
      ],
      mobile: [
        { required: true, message: '请输入电话', trigger: 'blur' }, 
        { min: 3, max: 11, message: '长度在 3 到 11 个字符', trigger: 'blur' },
        // { validator: checkMobile, trigger: 'blur' }
      ]
     }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      // ajax请求
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听pageSize 改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听switch开关状态变化的函数
    async userStateChange(userInfo) {
      console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status!==200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')  
    },
    // 监听对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加用户的网路请求
        // console.log(valid)
        const { data: res } = await this.$http.post('users', this.addForm)
           if (res.meta.status!==201) {
            //  console.log(res.meta.status)
             return this.$message.error('添加用户网络请求失败')
           }
           this.$message.success('添加用户成功')
          //  隐藏添加用户的对话框
           this.addDialogVisible = false
         // 重新获取用户列表的数据 
            this.getUserList()     
     })
    },
    // 展示编辑用户的对话框
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status!==200) {
            //  console.log(res.meta.status)
             return this.$message.error('查询用户请求失败')
           }
           this.editForm = res.data
      this.EditdialogVisible = true
    },
    // 监听修改对话框的关闭事件
    editDialogclose () {
      // resetFiles函数重置整个表单
      this.$refs.editFormref.resetFields()
    },

    EdituserInfo () {
      this.$refs.editFormref.validate(async valid => {
        // <!-- 先进行预验证 -->
        if (!valid) return
        // 可以发起编辑用户的网路请求
        // console.log(valid)
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {email:this.editForm.email,moblie:this.editForm.mobile})
           if (res.meta.status!==200) {
            //  console.log(res.meta.status)
             return this.$message.error('编辑用户网络请求失败')
           }
          //  console.log(this.editForm.mobile)
          //  console.log(res)
          //  提示用户提交成功了
           this.$message.success('编辑用户成功')
          //  隐藏添加用户的对话框
           this.EditdialogVisible = false
         // 重新获取用户列表的数据 
            this.getUserList()     
     })
    },
    async removeUserbyid(id) {
      // 弹窗询问用户是否删除数据
      const confirmresult = await this.$confirm('是否永久删除用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
    // 如果确认删除，则返回值为字符串confirm
    // 如果取消删除，则返回值为字符串concel
      // console.log(confirmresult)
       if(confirmresult !== 'confirm'){
       return this.$message.info('已取消删除')
      }
      // console.log('确认删除')
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status!==200) {
            //  console.log(res.meta.status)
             return this.$message.error('删除用户失败')
           }
        this.$message.info('删除用户成功')
        this.getUserList()     
    },
    // 分配角色
    async setrole (userinfo) {
      this.UserInfo = userinfo

      // 在展示对话框之前，获取所有角色的列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status!==200) {
            //  console.log(res.meta.status)
             return this.$message.error('获取角色列表请求失败')
           }
           this.rolelist = res.data
      this.setroledialogVisible = true
    },
    // 点击按钮，添加新角色
    async saveroleinfo () {
        if (!this.selectedroleid) {
        return this.$message.error('请选择要分配的角色')
        }
        // 可以发起添加新角色的网路请求
        const { data: res } = await this.$http.put('users/${this.UserInfo.id}/role',{rid: this.selectedroleid})
           if (res.meta.status!==400) {
            //  console.log(res.meta.status)
              return this.$message.error('更新角色失败')
           }
           console.log(res)
           this.$message.success('更新角色成功')
          //  隐藏更新角色的对话框
           this.setroledialogVisible = false
         // 重新获取用户列表的数据 
            this.getUserList()     
    },
    // 监听设置角色对话框的关闭
    setroledialogclosed () {
      this.UserInfo = ''
      this.selectedroleid = ''
    }
  }
}
</script>

<style lang="less" scoped>
</style>