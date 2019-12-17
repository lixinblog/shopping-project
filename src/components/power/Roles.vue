<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button
            type="primary"
            @click="addDialogVisible=true"
          >添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table
        :data="rolelist"
        border
        strips
      >
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1===0?'bdtop':'']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
              class="vcenter"
            >
              <!-- i1为索引,如果索引为0，就给他加个顶边框 -->
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <!-- 第一列到第五列渲染为第一级权限 -->
                <el-tag closable
                      @close="RemoveUserbyid(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 剩下的十九列作为第二级和第三级权限 -->
                <el-row
                  :class="[i2===0?'':'bdtop']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  class="vcenter"
                >
                  <!-- i2为索引,如果索引为0，就不给他加个顶边框，否则就添加顶边框 -->
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <!-- 接下来的六列渲染为第二级权限 -->
                    <el-tag type="success"  closable
                      @close="RemoveUserbyid(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 接下来的列渲染为第三级权限 -->
                    <el-tag
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="RemoveUserbyid(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          <!-- <pre>
            {{scope.row}}
          </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>

        <el-table-column
          label="角色名称"
          prop="roleName"
        ></el-table-column>
        <el-table-column
          label="角色描述"
          prop="roleDesc"
        ></el-table-column>
        <el-table-column
          label="操作"
          width="300px"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserbyid(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showsetrightdialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色的对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="addForm"
        :rules="addFormrules"
        ref="addFormRef"
        label-width="90px"
      >
        <el-form-item
          label="角色名称"
          prop="roleName"
        >
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item
          label="角色描述"
          prop="roleDesc"
        >
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addRoles"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="EditdialogVisible"
      width="50%"
      @close="editDialogclose"
    >
      <el-form
        :model="editForm"
        :rules="editFormrules"
        ref="editFormref"
        label-width="80px"
      >
        <el-form-item
          label="角色名称"
          prop="roleName"
        >
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item
          label="角色描述"
          prop="roleDesc"
        >
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="EditdialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="EdituserInfo"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog
  title="分配权限"
  :visible.sync="setRightdialogVisible"
  width="30%" @close="setRightDialogclosed"
  >
  <!-- 树形控件 -->
  <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defkey" ref="treeRef"></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRightdialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色的列表
      rolelist: [],
      // 分配权限对话框的显示与隐藏
      setRightdialogVisible: false,
      // 所有权限的数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点的id值
      defkey: [],
      // 当前即将分配权限的id
      roleid: '',
      // 添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 修改角色对话框的显示与隐藏
      EditdialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加表单数据的规则对象
      addFormrules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      },
      editForm: {},
      editFormrules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolelist = res.data
      console.log(this.rolelist)
    },
    // 监听对话框的关闭事件
    addDialogClosed() {
      //   实现表单重置
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加角色
    addRoles() {
      // 先进行表单的预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加角色的网路请求
        // console.log(valid)
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          //  console.log(res.meta.status)
          return this.$message.error('添加角色网络请求失败')
        }
        this.$message.success('添加角色成功')
        //  隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表的数据
        this.getRolesList()
      })
    },
    // 监听修改对话框的关闭事件
    editDialogclose() {
      // resetFiles函数重置整个表单
      this.$refs.editFormref.resetFields()
    },
    // 展示编辑角色的对话框
    async showEditDialog(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        //  console.log(res.meta.status)
        return this.$message.error('查询角色请求失败')
      }
      this.editForm = res.data
      this.EditdialogVisible = true
    },
    EdituserInfo() {
      this.$refs.editFormref.validate(async valid => {
        // <!-- 先进行预验证 -->
        if (!valid) return
        // 可以发起编辑用户的网路请求
        // console.log(valid)
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.id,
          { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc }
        )
        if (res.meta.status !== 400) {
          //  console.log(res.meta.status)
          return this.$message.error('编辑用户网络请求失败')
        }
        console.log(res)
        this.$message.success('编辑用户成功')
        //  隐藏添加用户的对话框
        this.EditdialogVisible = false
        // 重新获取用户列表的数据
        this.getRolesList()
      })
    },
    async removeUserbyid(id) {
      // 弹窗询问用户是否删除数据
      const confirmresult = await this.$confirm(
        '是否永久删除权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果确认删除，则返回值为字符串confirm
      // 如果取消删除，则返回值为字符串concel
      // console.log(confirmresult)
      if (confirmresult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // console.log('确认删除')
      const { data: res } = await this.$http.delete('roles/' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        //  console.log(res.meta.status)
        return this.$message.error('删除权限失败')
      }
      //  console.log(res)
      this.$message.info('删除权限成功')
      this.getRolesList()
    },
    // 根据id删除对应权限
    async RemoveUserbyid(Roles,id) {
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
      const { data: res } = await this.$http.delete(`roles/${Roles.id}/rights/${id}`)
      if (res.meta.status!==200) {
            //  console.log(res.meta.status)
             return this.$message.error('删除权限失败')
           }
        this.$message.info('删除权限成功')
        // 删除权限后，还是在原页面
        Roles.children=res.data
        // this.getRolesList()，这样的话会返回到角色页面     
     },
    //  展示分配权限的对话框
    async showsetrightdialog(role){
      // scope.row就是当前的角色
      this.roleid = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status!==200) {
            //  console.log(res.meta.status)
             return this.$message.error('获取所有权限失败')
           }
        this.$message.info('获取所有权限成功')  
        // 把数据保存到rightslist中
        this.rightslist = res.data
        console.log(this.rightslist)

        // 递归获取三级节点的id
        this.getLeafKeys(role, this.defkey)
       this.setRightdialogVisible = true
     },
    //  通过递归的形式，获取角色下所有三级权限的id，并保存到defkey数组中
    getLeafKeys(node,arr){
      // 如果当前弄得节点不包含children属性，则是三级节点
      if(!node.children){
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogclosed () {
      this.defkey = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const key = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const idStr = key.join(',')
      const {data: res} = await  this.$http.post(`roles/${this.roleid}/rights`, { rids: idStr})
      if(res.meta.status !== 200) {
        return this.$message.error('角色授权失败')
      }

       this.$message.success('角色授权成功')
        //  隐藏添加用户的对话框
        this.setRightdialogVisible = false
        // 重新获取用户列表的数据
        this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
  // padding: 7px
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.bdtop {
  border-top: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>