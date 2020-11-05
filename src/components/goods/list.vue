<template>
  <div>
    <!-- breadcrumb header -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">Homepage</el-breadcrumb-item>
      <el-breadcrumb-item>Goods</el-breadcrumb-item>
      <el-breadcrumb-item>GoodList</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- Card -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="Please input" v-model="queryInfo.query" @clear="getGoodList()" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getGoodList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goToAddPage">Add new good</el-button>
        </el-col>
      </el-row>
      <!-- table -->
      <el-table :data="goodslist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="Name" prop="goods_name"></el-table-column>
        <el-table-column label="Price(¥)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="Weight" prop="goods_weight" width="95px"></el-table-column>
        <el-table-column label="Created at" prop="add_time" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="Operation" width="130px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGoodByID(scope.row.goods_id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodByID(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
     <!-- pagination -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5,10,15,20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
      </el-pagination>
    </el-card>
    <!-- edit form -->
    <el-dialog
      title="Edit Good"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="110px" label-position="top">
        <el-form-item label="Name" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="Price" prop="goods_price">
          <el-input v-model="editForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="Quantity" prop="goods_number">
          <el-input v-model="editForm.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item label="Weight" prop="goods_weight">
          <el-input v-model="editForm.goods_weight" type="number"></el-input>
        </el-form-item>

        <!-- many -->
        <el-form-item :label="item.attr_name" v-for="(item,i) in manyTableData" :key="i">
          <el-checkbox-group v-model="item.attr_value">
            <el-checkbox :label="itemV" v-for="(itemV,iV) in item.attr_value" :key="iV" border></el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- only -->
        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
          <el-input v-model="item.attr_value"></el-input>
        </el-form-item>

        <!-- upload img -->
        <el-upload
          :action="uploadURL"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :file-list="previousIMGList"
          :on-success="handleSuccess"
          :headers="headersObj"
          list-type="picture">
          <el-button size="small" type="primary">Upload</el-button>
        </el-upload>
      <quill-editor v-model="editForm.goods_introduce"></quill-editor>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="editGoodSubmit()">Confirm</el-button>
      </span>
    </el-dialog>
    <!-- img preview -->
      <el-dialog
      title="Img Preview"
      :visible.sync="imgPreviewdialogVisible"
      width="50%"
      >
      <img :src="previewIMGPath" alt="" class="previewImg">
      <span slot="footer" class="dialog-footer">
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodslist: [],
      total: 0,
      editDialogVisible: false,
      editForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      editFormRules: {
        goods_name: [{
          required: true, message: 'Please input good\'s name', trigger: 'blur'
        }],
        goods_price: [{
          required: true, message: 'Please input good\'s price', trigger: 'blur'
        }],
        goods_weight: [{
          required: true, message: 'Please input good\'s weight', trigger: 'blur'
        }],
        goods_number: [{
          required: true, message: 'Please input good\'s quantity', trigger: 'blur'
        }]
      },
      manyTableData: [],
      onlyTableData: [],
      headersObj: { Authorization: window.sessionStorage.getItem('token') },
      imgPath: [],
      previousIMGList: [],
      imgPreviewdialogVisible: false,
      previewIMGPath: '',
      goodsId: '',
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload'
    }
  },
  created () {
    this.getGoodList()
  },
  methods: {
    async getGoodList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get good list!')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodList()
    },
    async removeGoodByID (id) {
      const confirmResult = await this.$confirm('Are you sure to delete the good?', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('Canceled')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to delete the good!')
      }
      this.$message.success('Delete good successfully!')
      this.getGoodList()
    },
    goToAddPage () {
      this.$router.push('/goods/add')
    },
    async editGoodByID (id) {
      const { data: res } = await this.$http.get('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get good\'s data!')
      }
      this.editForm.goods_name = res.data.goods_name
      this.editForm.goods_price = res.data.goods_price
      this.editForm.goods_number = res.data.goods_number
      this.editForm.goods_weight = res.data.goods_weight
      this.editForm.goods_introduce = res.data.goods_introduce
      this.editForm.pics = res.data.pics
      this.editForm.attrs = res.data.attrs
      this.goodsId = id
      this.manyTableData = []
      this.onlyTableData = []
      this.editForm.attrs.forEach(item => {
        if (item.attr_sel === 'only') {
          this.onlyTableData.push(item)
        } else {
          item.attr_value = item.attr_value.split(' ')
          this.manyTableData.push(item)
        }
      })
      console.log(this.manyTableData)
      console.log(this.onlyTableData)
      const imgList = []
      this.editForm.pics.forEach(item => {
        const obj = { name: item.pics_id, url: item.pics_big_url }
        imgList.push(obj)
      })
      this.previousIMGList = imgList
      this.editDialogVisible = true
    },
    editDialogClose () {
      this.imgPath = []
      this.previousIMGList = []
    },
    handlePreview (file) {
      this.imgPreviewdialogVisible = true
      this.previewIMGPath = file.url
    },
    handleRemove (file, fileList) {
      const i = this.editForm.pics.findIndex(x => x.pics_id === file.name)
      this.editForm.pics.splice(i, 1)
    },
    handleSuccess (response, file, fileList) {
      if (file.response.meta.status !== 200) {
        return this.$message.error('Fail to upload the img')
      }
      this.editForm.pics.push({
        pics_id: file.name,
        pics_big: file.response.data.tmp_path,
        pics_big_url: file.response.data.url
      })
    },
    async editGoodSubmit () {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) {
          return this.$message.error('Please enter all compulsory form items!')
        }
      })
      const editForm = {
        goods_name: this.editForm.goods_name,
        goods_price: this.editForm.goods_price,
        goods_number: this.editForm.goods_number,
        goods_weight: this.editForm.goods_weight,
        goods_introduce: this.editForm.goods_introduce,
        pics: [],
        attrs: [],
        goods_cat: '1, 2, 3'
        // ERROR: api need goods_cat attribute, however, the goods info does not contains this value!
        // it will update the category of the good, which is an ERROR!
      }
      this.editForm.attrs.forEach(item => {
        if (item.attr_sel === 'many') {
          const obj = {
            attr_id: item.attr_id,
            attr_value: item.attr_value.join(' ')
          }
          editForm.attrs.push(obj)
        } else {
          editForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_value
          })
        }
      })
      this.editForm.pics.forEach(item => {
        if (typeof (item.pics_id) !== 'number') {
          editForm.pics.push({ pic: item.pics_big })
        }
      })
      console.log(this.editForm)
      const { data: res } = await this.$http.put(`goods/${this.goodsId}`, editForm)
      this.editDialogVisible = false
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to edit good\'s information!')
      }
      return this.$message.success('Update successfully!')
    }
  }
}
</script>

<style lang="less" scoped>
.previewImg {
  width: 100%;
}
.el-checkbox {
    margin: 0 10px 0 0 !important;
 }
</style>
