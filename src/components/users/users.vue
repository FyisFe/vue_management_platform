<template>
    <div>
      <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Homepage</el-breadcrumb-item>
      <el-breadcrumb-item>User</el-breadcrumb-item>
      <el-breadcrumb-item>Activities</el-breadcrumb-item>
      </el-breadcrumb>
      <el-card>
        <el-row :gutter="20">
          <el-col :span = '7'>
            <el-input placeholder="Content">
            <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </el-col>
          <el-col :span = '4'>
            <el-button type="primary">Add User</el-button>
          </el-col>
        </el-row>
      </el-card>
    </div>
</template>

<script>
export default {

}
</script>

<style lang="less" scoped>

</style>
