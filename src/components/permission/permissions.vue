<template>
    <div>
      <!-- breadcrumb navigator -->
      <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">Homepage</el-breadcrumb-item>
      <el-breadcrumb-item>Permission Management</el-breadcrumb-item>
      <el-breadcrumb-item>List</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- card view -->
      <el-card>
        <el-table :data = permissionsList border stripe>
          <el-table-column label="#" type = 'index'></el-table-column>
          <el-table-column label = 'authName' prop="authName"></el-table-column>
          <el-table-column label = 'Path' prop="path"></el-table-column>
          <el-table-column label = 'Level' prop="level">
            <template v-slot = "scope">
                <el-tag v-if="scope.row.level === '0'">Level 1</el-tag>
                <el-tag type="success" v-else-if="scope.row.level === '1'">Level 2</el-tag>
                <el-tag type="warning" v-else>Level 3</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      permissionsList: []
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get permissions list!')
      }
      this.permissionsList = res.data
      console.log(this.permissionsList)
    }
  }
}
</script>
<style lang="less" scoped>
</style>
