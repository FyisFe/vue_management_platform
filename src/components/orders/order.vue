<template>
    <div>
      <!-- breadcrumb navigator -->
      <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">Homepage</el-breadcrumb-item>
      <el-breadcrumb-item>Permission Management</el-breadcrumb-item>
      <el-breadcrumb-item>Order</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- card view -->
      <el-card>
        <el-row>
          <el-col :span="8">
            <el-input placeholder="Please input">
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </el-col>
        </el-row>
        <!-- table -->
        <el-table :data="orderlist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="ID" prop="order_number"></el-table-column>
        <el-table-column label="Price" prop="order_price"></el-table-column>
        <el-table-column label="Status" prop="pay_status">
          <template v-slot='scope'>
            <el-tag type="success" v-if="scope.row.pay_status==='1'">Paid</el-tag>
            <el-tag type="danger" v-else>Not paid</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="IfSend" prop="is_send"></el-table-column>
        <el-table-column label="Create_time" prop="create_time">
          <template v-slot='scope'>
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="Operation">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog()"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox()"></el-button>
          </template>
        </el-table-column>
      </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[5,10,15,20]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>
      <!-- edit address dialog -->
      <el-dialog
        title="Edit address"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="addressDialogClose"
      >
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px" >
          <el-form-item label="Address" prop="address">
            <el-cascader :options="cityData" v-model="addressForm.address"></el-cascader>
          </el-form-item>
          <el-form-item label="Details" prop="detailAddress">
            <el-input v-model="addressForm.detailAddress"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="addressClick">Confirm</el-button>
        </span>
    </el-dialog>
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
    </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      orderlist: [],
      editDialogVisible: false,
      addressForm: {
        address: [],
        detailAddress: ''
      },
      addressFormRules: {
        address: [{ required: true, message: 'Please input Provinces, cities and counties', trigger: 'blur' }],
        detailAddress: [{ required: true, message: 'Please input detail address', trigger: 'blur' }]
      },
      cityData,
      progressVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get order list!')
      }
      console.log(res)
      this.orderlist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    addressDialogClose () {
      this.$refs.addressFormRef.resetFields()
    },
    showEditDialog () {
      this.editDialogVisible = true
    },
    addressClick () {
      this.$message.error('This funtion is under development!')
    },
    async showProgressBox () {
      const csid = 1106975712662
      const { data: res } = await this.$http.get(`/kuaidi/${csid}`)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get progress!')
      }
      this.progressInfo = res.data
      this.progressVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
</style>
