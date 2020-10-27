<template>
  <div>
  <!-- breadcrumb header -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">Homepage</el-breadcrumb-item>
      <el-breadcrumb-item>Goods</el-breadcrumb-item>
      <el-breadcrumb-item>Categories</el-breadcrumb-item>
    </el-breadcrumb>
  <!-- Card -->
    <el-card>
      <el-row>
          <!-- for add new category  -->
          <el-col>
              <el-button type="primary" @click="showAddCategoryDialog">Add new category</el-button>
          </el-col>
      </el-row>
      <!-- tree table -->
      <zk-table
      :data = 'categoryList'
      :columns = 'columns'
      :selection-type = 'false'
      :expand-type = 'false'
      show-index
      index-text = '#'
      border
      class="treeTable"
      >
        <!-- valid -->
        <template v-slot:valid = 'scope'>
            <i v-if='!scope.row.cat_deleted' class='el-icon-success' style="color: lightgreen;"></i>
            <i v-else class='el-icon-error' style="color: red;"></i>
        </template>
        <!-- level -->
        <template v-slot:order = 'scope'>
          <el-tag v-if="scope.row.cat_level === 0" size = 'mini'>Level 1</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" size = 'mini' type="success">Level 2</el-tag>
          <el-tag v-else size = 'mini' type="warning">Level 3</el-tag>
        </template>
        <!-- operation -->
         <template v-slot:opt = 'scope'>
           <el-button type='primary' icon="el-icon-edit" size='mini' @click="getEditCategory(scope.row.cat_id)">Edit</el-button>
           <el-button type='danger' icon="el-icon-delete" size='mini' @click="deleteCategory(scope.row.cat_id)">Delete</el-button>
        </template>
      </zk-table>
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
    <!-- add new category -->
    <el-dialog
      title="Add new category"
      :visible.sync="addCategoryDialogVisible"
       width="50%"
       @close='addCategoryDialogClose'
    >
      <span>
        <el-form :model="addCategoryForm" :rules="addCategoryFormRules" ref="addCategoryFormRef" label-width="120px">
          <el-form-item label="Category name:" prop="cat_name">
            <el-input v-model="addCategoryForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="Parent category:">
            <el-cascader
              v-model="selectKeys"
              :options="parentCategoryList"
              :props= 'cascaderProps'
              @change="parentCategoryChange"
              clearable
              filterable
              >
            </el-cascader>
          </el-form-item>
        </el-form>
      </span>
      <el-button @click="addCategoryDialogVisible = false">Cancel</el-button>
      <el-button type="primary" @click="addNewCategory">Confirm</el-button>
    </el-dialog>
    <!-- edit category -->
    <el-dialog
      title="Edit category"
      :visible.sync="editCategoryDialogVisible"
      width="50%"
      >
      <el-form :model="editCategoryForm" :rules="addCategoryFormRules" ref="editCategoryFormRef" label-width="100px">
        <el-form-item label="Category name:" prop="cat_name">
          <el-input v-model="editCategoryForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCategoryDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="editCategory">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1, // current page
        pagesize: 5 // number of data in on page
      },
      categoryList: [],
      total: 0, // total number of categories data
      columns: [{
        label: 'Category name',
        prop: 'cat_name'
      }, {
        label: 'Valid',
        type: 'template',
        template: 'valid'
      }, {
        label: 'Level',
        type: 'template',
        template: 'order'
      }, {
        label: 'Operation',
        type: 'template',
        template: 'opt'
      }
      ],
      addCategoryDialogVisible: false,
      addCategoryForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCategoryFormRules: {
        cat_name: [
          { required: true, message: 'please enter category name', trigger: 'blur' }
        ]
      },
      parentCategoryList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      selectKeys: [],
      editCategoryForm: {
        cat_id: '',
        cat_name: ''
      },
      editCategoryDialogVisible: false
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })

      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get categories\' data')
      }
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoryList()
    },
    handleCurrentChange (newPageNumber) {
      this.queryInfo.pagenum = newPageNumber
      this.getCategoryList()
    },
    showAddCategoryDialog () {
      this.getParentCategoryList()
      this.addCategoryDialogVisible = true
    },
    async getParentCategoryList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('Fail to get parent category list!')
      this.parentCategoryList = res.data
      console.log(this.parentCategoryList)
    },
    parentCategoryChange () {
      console.log(this.selectKeys)
      const len = this.selectKeys.length
      if (len > 0) {
        this.addCategoryForm.cat_pid = this.selectKeys[len - 1]
        this.addCategoryForm.cat_level = len
      } else {
        this.addCategoryForm.cat_pid = 0
        this.addCategoryForm.cat_level = 0
      }
    },
    addNewCategory () {
      console.log(this.addCategoryForm)
      this.$refs.addCategoryFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('Your input is invalid!')
        }
        const { data: res } = await this.$http.post('categories', this.addCategoryForm)
        if (res.meta.status !== 201) {
          this.$message.error('Fail to add new category!')
        }
        this.$message.success('Add new category successfully!')
        this.getCategoryList()
        this.addCategoryDialogVisible = false
      })
    },
    addCategoryDialogClose () {
      this.$refs.addCategoryFormRef.resetFields()
      this.selectKeys = []
      this.addCategoryForm.cat_level = 0
      this.addCategoryForm.cat_pid = 0
    },
    async getEditCategory (catID) {
      const { data: res } = await this.$http.get('categories/' + catID)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get category info!')
      }
      this.editCategoryForm.cat_id = res.data.cat_id
      this.editCategoryForm.cat_name = res.data.cat_name
      this.editCategoryDialogVisible = true
    },
    editCategory () {
      this.$refs.editCategoryFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('Your input is wrong!')
        } else {
          const { data: res } = await this.$http.put('categories/' + this.editCategoryForm.cat_id, { cat_name: this.editCategoryForm.cat_name })
          console.log(res)
          if (res.meta.status !== 200) {
            return this.$message.error('Fali to updata!')
          } else {
            this.$message.success('Updated Successfully!')
            this.editCateDialogVisible = false
            this.getCategoryList()
          }
        }
      })
    },
    async deleteCategory (catID) {
      const confirmResult = await this.$confirm('Are you sure to delete this permission?', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('Canceled')
      }
      const { data: res } = await this.$http.delete(`categories/${catID}`)
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to delete')
      }
      this.$message.success('Deleted Successfully')
      this.getCategoryList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}

</style>
