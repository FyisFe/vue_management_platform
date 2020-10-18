<template>
    <div>
      <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">Homepage</el-breadcrumb-item>
      <el-breadcrumb-item>User</el-breadcrumb-item>
      <el-breadcrumb-item>Activities</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-row :gutter="20">
          <el-col :span = '7'>
            <el-input placeholder="Content" v-model="queryInfo.query" clearable @clear = "getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span = '4'>
            <el-button type="primary" @click="addDialogVisible = true">Add User</el-button>
          </el-col>
        </el-row>
        <el-table :data = userList border stripe="">
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="Username" prop="username"></el-table-column>
          <el-table-column label="Email" prop="email"></el-table-column>
          <el-table-column label="Phone" prop="mobile"></el-table-column>
          <el-table-column label="Role" prop="role_name"></el-table-column>
          <el-table-column label="Status">
            <template v-slot="scope">
              <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="Operation" width="180px">
            <template v-slot="scope">
              <el-tooltip effect="dark" content="Edit" placement="top" :enterable="false">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="toggleEditDialog(scope.row.id)"></el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="Delete" placement="top" :enterable="false">
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="Set role" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1,2,5,10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
      <el-dialog
        title="Add new user"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="dialogClosed"
      >
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="110px">
            <el-form-item label="Username" prop="username">
              <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="Password" prop="password">
              <el-input v-model="addForm.password"></el-input>
            </el-form-item>
            <el-form-item label="E-mail" prop="email">
              <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="Phone number" prop="mobile">
              <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
          </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="addDialogVisible = false">Cancel</el-button>
              <el-button type="primary" @click="addUser">Confirm</el-button>
            </span>
      </el-dialog>
      <el-dialog
        title="Edit user info"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="110px">
            <el-form-item label="User name">
              <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="Email" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="Phone number" prop="mobile">
              <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="editUser">Confirm</el-button>
          </span>
      </el-dialog>
      <!-- set role -->
      <el-dialog
        title="Set Role"
        :visible.sync="setDialogVisible"
        width="50%"
        @close='setDialogClosed'
      >
        <div>
          <p> Current User: {{userInfo.username}}</p>
          <p> Current Role: {{userInfo.role_name}}</p>
          <p> Set new Role:
            <el-select v-model="selectedRowId" placeholder="请选择">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="saveRoleInfo">Confirm</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('Please input valid email!'))
    }
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^[1]([3-9])[0-9]{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('Please input valid phone number!'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: 'please enter your username', trigger: 'blur' },
          { min: 3, max: 8, message: 'the length should be between 3 and 8', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'please enter your password', trigger: 'blur' },
          { min: 6, max: 15, message: 'the length should be between 6 and 15', trigger: 'blur' }
        ],
        email: [
          { required: true, message: 'please enter your email', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: 'please enter your phone number', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editForm: {},
      editFormRules: {
        username: [
          { required: true, message: 'please enter your username', trigger: 'blur' },
          { min: 3, max: 8, message: 'the length should be between 3 and 8', trigger: 'blur' }
        ],
        email: [
          { required: true, message: 'please enter your email', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: 'please enter your phone number', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      setDialogVisible: false,
      userInfo: {},
      rolesList: {},
      selectedRowId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('Fail to obtain user info!')
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async changeUserState (userinfo) {
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('Fail to update status!')
      }
      this.$message.success('Update successfully!')
    },
    dialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('Fail to add user!')
        }

        this.$message.success('Add user successfully!')
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    async toggleEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to search user info!')
      }
      this.editForm = res.data
      this.editDialogVisible = !this.editDialogVisible
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('Your input is invalid!')
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('Fail to update user info!')
        }
        this.$message.success('Update user info successfully!')
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    async removeUserById (id) {
      const confirmResult = await this.$confirm('Are you sure to delete the user?', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('Canceled')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to delete the user!')
      }
      this.$message.success('Delete user successfully!')
      this.getUserList()
    },
    async setRole (userinfo) {
      this.setDialogVisible = true
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get roles list!')
      }
      this.rolesList = res.data
      this.userInfo = userinfo
    },
    async saveRoleInfo () {
      if (!this.selectedRowId) {
        return this.$message.error('Please select a role!')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRowId })
      if (res.meta.status !== 200) {
        return this.$http.error('Fail to update role info!')
      }
      this.$message.success('Updated successfully!')
      this.getUserList()
      this.setDialogVisible = false
    },
    setDialogClosed () {
      this.selectedRowId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>

</style>
