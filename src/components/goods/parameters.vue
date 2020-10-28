<template>
  <div>
    <!-- breadcrumb header -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">Homepage</el-breadcrumb-item>
      <el-breadcrumb-item>Goods</el-breadcrumb-item>
      <el-breadcrumb-item>Parameters</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- Card -->
    <el-card>
      <el-alert
      title="You can only set parameters to level 3 categories"
      type="warning"
      :closable="false"
      show-icon
      ></el-alert>
      <!-- select category -->
      <el-row class="category-option">
        <el-col>
          <span>Select category: </span>
          <el-cascader
          v-model="selectKeys"
          :options="categoryList"
          :props="categoryProps"
          @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab  -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="Parameters" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">Add new parameter</el-button>
          <!-- table -->
          <el-table :data='manyTableData' border stripe>
            <el-table-column type="expand">
              <template v-slot='scope'>
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">
                  {{item}}
                </el-tag>
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="Parameter name" prop="attr_name"></el-table-column>
            <el-table-column label="Operations">
              <template v-slot='scope'>
                <el-button size = 'mini' type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">Edit</el-button>
                <el-button size = 'mini' type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="Property" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">Add new property</el-button>
          <el-table :data='onlyTableData' border stripe>
            <el-table-column type="expand">
              <template v-slot='scope'>
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleClose(index,scope.row)">
                  {{item}}
                </el-tag>
                <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="Property name" prop="attr_name"></el-table-column>
            <el-table-column label="Operations">
              <template v-slot='scope'>
                <el-button size = 'mini' type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">Edit</el-button>
                <el-button size = 'mini' type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- add parameters dialog -->
    <el-dialog
    :title="'Add ' + dialogTitle"
    :visible.sync="addDialogVisible"
    width="50%"
    @close='addDialogClosed'
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="110px">
        <el-form-item :label="dialogTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button @click="addDialogVisible = false">Cancel</el-button>
      <el-button type="primary" @click="addParams">Confirm</el-button>
     </span>
    </el-dialog>
    <el-dialog
    :title="'Edit ' + dialogTitle"
    :visible.sync="editDialogVisible"
    width="50%"
    @close='editDialogClosed'
    >
    <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="110px">
      <el-form-item :label="dialogTitle" prop="attr_name">
        <el-input v-model="editForm.attr_name"></el-input>
      </el-form-item>
    </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">Cancel</el-button>
      <el-button type="primary" @click="editParams">Confirm</el-button>
     </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      categoryList: [],
      categoryProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectKeys: {},
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{
          required: true, message: 'Please input name', trigger: 'blur'
        }]
      },
      editDialogVisible: false,
      editForm: {
        attr_name: '',
        attr_id: 0
      },
      tagList: []
    }
  },
  created () {
    this.getCategoryList()
  },
  computed: {
    isBtnDisabled () { return this.selectKeys.length !== 3 },
    dialogTitle () {
      if (this.activeName === 'many') {
        return 'parameters'
      } else {
        return 'properties'
      }
    }
  },
  methods: {
    async getCategoryList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('Fail to get category list!')
      this.categoryList = res.data
    },
    async handleChange () {
      if (this.selectKeys.length !== 3) {
        this.selectKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.error('You must select level 3 categories')
      }
      const { data: res } = await this.$http.get(`categories/${this.getCategoryId()}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get parameters!')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    handleTabClick () {
      this.handleChange()
    },
    getCategoryId () {
      if (this.selectKeys.length === 3) { return this.selectKeys[2] }
      return null
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('Your input is invalid!')
        }
        const { data: res } = await this.$http.post(`categories/${this.getCategoryId()}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('Fail to add new parameters')
        }
        this.$message.success('Added successfully!')
        this.addDialogVisible = false
        this.getCategoryList()
        this.handleChange()
      })
    },
    showEditDialog (attr) {
      this.editForm.attr_name = attr.attr_name
      this.editForm.attr_id = attr.attr_id
      this.editDialogVisible = true
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('Your input is wrong!')
        } else {
          const { data: res } = await this.$http.put(`categories/${this.getCategoryId()}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
          console.log(this.getCategoryId())
          if (res.meta.status !== 200) {
            return this.$message.error('Fail to edit!')
          }
          this.$message.success('Updated successfully!')
          this.handleChange()
          this.editDialogVisible = false
        }
      })
    },
    async removeParams (attrID) {
      const confirmResult = await this.$confirm('Are you sure to delete the user?', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('Canceled')
      } else {
        const { data: res } = await this.$http.delete(`categories/${this.getCategoryId()}/attributes/${attrID}`)
        if (res.meta.status !== 200) {
          return this.$message.error('Fail to delete!')
        }
        this.$message.success('Deleted successfully!')
        this.handleChange()
      }
    },
    handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      } else {
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        this.saveAttrVals(row)
      }
    },
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.getCategoryId()}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to update!')
      }
      this.$message.success('Updated successfully!')
    },
    showInput (row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleClose (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttrVals(row)
    }
  }
}
</script>
<style lang="less" scoped>
.category-option {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
    width: 120px;
}
</style>
