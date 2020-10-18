<template>
    <div>
      <!-- breadcrumb navigator -->
      <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">Homepage</el-breadcrumb-item>
      <el-breadcrumb-item>Roles Management</el-breadcrumb-item>
      <el-breadcrumb-item>List</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- card view -->
      <el-card>
        <el-row>
          <el-col>
            <el-button type="primary" @click="addDialogVisible = true">Add New Role</el-button>
          </el-col>
        </el-row>
        <el-table :data = rolesList border stripe>
          <el-table-column :data = 'rolesList' type= 'expand'>
            <template v-slot = 'scope'>
              <el-row :class="['bdBottom', index1 === 0 ? 'bdTop' : '','centreRole']" v-for="(item1,index1) in scope.row.children" :key="item1.id">
                <!-- Level 1 permission -->
                <el-col :span="5">
                  <el-tag closable @close="removePermission(scope.row,item1)">{{item1.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                <!-- Level 2 permission -->
                  <el-row :class="[index2 === 0 ? '' : 'bdTop', 'centreRole']," v-for="(item2,index2) in item1.children" :key="item2.id">
                    <el-col :span="6">
                      <el-tag closable type="success" @close="removePermission(scope.row,item2)">{{item2.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag closable type="warning" v-for="(item3) in item2.children" :key="item3.id" @close="removePermission(scope.row,item3)">{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column label="#" type = 'index'></el-table-column>
          <el-table-column label = 'Role name' prop="roleName"></el-table-column>
          <el-table-column label = 'Description' prop="roleDesc"></el-table-column>
          <el-table-column label = 'Opeartion' prop="level" width="300px">
            <template v-slot = "scope">
                <el-button size = 'mini' type="primary" icon="el-icon-edit" @click="editRoleById(scope.row.id,scope.row.roleName)">Edit</el-button>
                <el-button size = 'mini' type="danger" icon="el-icon-delete" @click="deleteRoleById(scope.row.id)">Delete</el-button>
                <el-button size = 'mini' type="warning" icon="el-icon-setting" @click="showSetDialog(scope.row)">Set</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <!-- add role dialog -->
      <el-dialog
      title="Add new role"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="dialogClosed"
      >
      <el-form :model="AddRoleForm" :rules="AddRoleRules" ref="AddRoleFormRef" label-width="110px">
        <el-form-item label="Role Name" prop="roleName">
          <el-input v-model="AddRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="Role Description" prop="roleDesc">
          <el-input v-model="AddRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addRoleInfo">Confirm</el-button>
      </span>
    </el-dialog>
    <!-- Edit Role -->
    <el-dialog
      title="Edit Role"
      :visible.sync="editRoleVisible"
      width="50%"
      >
      <el-form :model="editRoleForm" :rules="AddRoleRules" ref="editRoleFormRef" label-width="110px">
        <el-form-item label="Role Name" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="Role Description">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleVisible = false">Cancel</el-button>
        <el-button type="primary" @click="editRoleInfo">Confirm</el-button>
      </span>
    </el-dialog>
    <!-- Set permission -->
    <el-dialog
      title="Set Permissions"
      :visible.sync="setRoleVisible"
      width="50%"
      @close='setRoleVisibleClose()'
      >
      <el-tree
        :data="permissionList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref='treeRef'
        ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleVisible = false">Cancel</el-button>
        <el-button type="primary" @click="allotPermissions">Confirm</el-button>
      </span>
    </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      rolesList: [],
      addDialogVisible: false,
      AddRoleForm: {
        roleName: '',
        roleDesc: '',
        roleId: ''
      },
      AddRoleRules: {
        roleName: [
          { required: true, message: 'Please Input Role Name', trigger: 'blur' },
          { min: 1, max: 12, message: 'Length should be between 1 and 12', trigger: 'blur' }
        ]
      },
      editRoleVisible: false,
      // 修改角色数据
      editRoleForm: {
        roleName: '',
        roleDesc: '',
        roleEditId: ''
      },
      setRoleVisible: false,
      permissionList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [],
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get roles list!')
      }
      this.rolesList = res.data
    },
    dialogClosed () {
      this.$refs.AddRoleFormRef.resetFields()
    },
    addRoleInfo () {
      this.$refs.AddRoleFormRef.validate(async (valid) => {
        if (valid !== true) {
          return this.$message.error('Please input correct user name')
        }
        const { data: res } = await this.$http.post('roles', this.AddRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('Fail to add new role!')
        } else {
          this.$message.success('Added successfuly!')
          this.addDialogVisible = false
          this.getRolesList()
        }
      })
    },
    async editRoleById (id, roleName) {
      this.editRoleVisible = true
      const { data: res } = await this.$http.put(`roles/${id}`, { roleName })
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get roles data!')
      }
      this.editRoleForm.roleName = res.data.roleName
      this.editRoleForm.roleDesc = res.data.roleDesc
      this.editRoleForm.roleEditId = res.data.roleId
    },
    editRoleInfo () {
      const id = this.editRoleForm.roleEditId
      this.$refs.editRoleFormRef.validate(async (valid) => {
        if (valid !== true) {
          return this.$message.error('Please input correct user name')
        }
        const { data: res } = await this.$http.put(`roles/${id}`, this.editRoleForm)
        if (res.meta.status !== 200) {
          return this.$message.error('Fail to get roles data!')
        } else {
          this.$message.success('Updated successfuly!')
          this.editRoleVisible = false
          this.getRolesList()
        }
      })
    },
    async deleteRoleById (id) {
      const confirmResult = await this.$confirm('Are you sure to delete the user?', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('Canceled')
      }
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to delete!')
      }
      this.$message.success('Deleted successfully！')
      this.getRolesList()
    },
    async removePermission (role, permission) {
      const confirmResult = await this.$confirm('Are you sure to delete this permission?', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('Canceled')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${permission.id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to delete this permission!')
      }
      role.children = res.data
      return this.$message.success('Deleted successfully!')
    },
    async showSetDialog (permission) {
      this.roleId = permission.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get permission tree!')
      }
      this.permissionList = res.data
      this.getLeafKeys(permission, this.defKeys)
      this.setRoleVisible = true
    },
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    setRoleVisibleClose () {
      this.defKeys = []
    },
    async allotPermissions () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`,
        { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to set permissions')
      }
      this.$message.success('Set permissions successfully!')
      this.getRolesList()
      this.setRoleVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdTop {
  border-top: 1px solid #eee;
}
.bdBottom {
  border-bottom: 1px solid #eee;
}
.centreRole {
  display: flex;
  align-items: center;
}
</style>
