<template>
    <div>
        <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

     <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索与添加区 -->
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="showaddcatedialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区 -->
        <tree-table class="treeTable" :data="catelist" :columns="colunm" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
            <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
            <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序  -->
        <template slot="sort" slot-scope="scope">
           <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
           <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
           <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt">
           <el-button type="primary" size="mini">编辑</el-button>
           <el-button type="danger" size="mini">删除</el-button>
        </template>
        </tree-table>
     
      <!-- 分页区 -->
       <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
  title="添加分类"
  :visible.sync="addcatedialogVisible"
  width="30%"
  >
  <!-- 添加分类的表单 -->
  <el-form :model="addcateForm" :rules="addcateFormrules" ref="addcateFormRef" label-width="100px">
  <el-form-item label="分类名称:" prop="cat_name">
    <el-input v-model="addcateForm.cat_name"></el-input>
  </el-form-item>
  <el-form-item label="父级分类:">
      <!-- options用来指定数据源 -->
      <!-- props用来指定配置对象 -->
      <el-cascader
      :props="{ expandTrigger: 'hover', value: 'cat_id',label: 'cat_name', children: 'children'}"
    v-model="selectkeys"
    :options="parentcatelist"
    @change="parentcateChange" clearable change-on-select></el-cascader>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addcatedialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addcatedialogVisible = false">确 定</el-button>
  </span>
</el-dialog>
    </div>
</template>

<script>
export default {
 data(){
     return {
        //  查询条件
         queryInfo: {
             type: 3,
             pagenum: 1,
             pagesize: 5
         },
        //  添加表单分类的数据对象
        addcateForm: {
        // 将要添加分类的名称
          cat_name: '',
        //   分类父 ID 
          cat_pid: 0,
        //   分类层级（默认添加的是一级分类）
          cat_level: 0
        },
        addcateFormrules: {
        cat_name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' }, 
        { min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur' }
      ]},
        addcatedialogVisible: false,
        // 父级分类的列表
        parentcatelist: [],
        //  商品分类的数据列表，默认为空
        catelist: [],
        total: 0,
        // 为table指定列的定义
        colunm: [
            {
                label: '分类名称',
                prop: 'cat_name'
            },
            {
                label: '是否有效',
                // 表示将当前列定义为模板列
                type: 'template',
                // 表示当前这一列使用模板名称
                template: 'isok'
            },
            {
                label: '排序',
                type: 'template',
                template: 'sort'
            },
            {
                label: '操作',
                type: 'template',
                template: 'opt'
            }
        ],
        // 指定级联选择器的配置对象
        // cascaderProps: {
        //     value: 'cat_id',
        //     label: 'cat_name',
        //     children: 'children'
        // },
        // 选中的父级分类的id数组
        selectkeys: []
     }
 },
 created() {
     this.getcateList()
 },
 methods: {
    //  获取商品分类数据
    async getcateList(){
         const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据列表失败！')
      }
      console.log(res.data)
    // 把数据列表赋给catelist
      this.catelist = res.data.result
    //   为总数据条数赋值
    this.total = res.data.total 
    },
    // 监听pagesize的变化
    handleSizeChange (newsize) {
        this.queryInfo.pagesize = newsize
        this.getcateList()
    },
    // 监听当前页面的变化
    handleCurrentChange (newpage) {
         this.queryInfo.pagenum = newpage
         this.getcateList()
    },
    showaddcatedialog () {
        // 先展示父级分类的数据列表
        this.getparentcatelist()
        // 再展示对话框
        this.addcatedialogVisible = true
    },
    // 获取父级分类的数据列表
    async getparentcatelist() {
        const { data: res } = await this.$http.get('categories', {
        params: {type: 3} })
        if (res.meta.status!==200) {
            //  console.log(res.meta.status)
             return this.$message.error('获取父级分类数据失败')
           }
        //    console.log(res.data)
        this.parentcatelist = res.data
    },
    // 选择项发生变化触发这个函数
    parentcateChange() {
        console.log(this.selectkeys)
    }
 }   
}
</script>

<style lang="less" scoped>
.treeTable{
    margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>
