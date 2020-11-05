<template>
  <div>
   <!-- breadcrumb header -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">Homepage</el-breadcrumb-item>
      <el-breadcrumb-item>Goods</el-breadcrumb-item>
      <el-breadcrumb-item>Add new good</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card -->
    <el-card>
    <!-- alert -->
    <el-alert
      title="Information needed"
      type="info"
      :closable="false"
      show-icon
      center
      ></el-alert>
    <!-- steps -->
    <el-steps :space="200" :active="stepActiveIndex" finish-status="success" align-center>
      <el-step title='Basic info'></el-step>
      <el-step title='Parameters'></el-step>
      <el-step title='Properties'></el-step>
      <el-step title='Images'></el-step>
      <el-step title='Contents'></el-step>
      <el-step title='Done'></el-step>
    </el-steps>
    <!-- tab -->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top" :before-leave="beforeTabLeave">
      <el-tabs v-model="stepActiveIndexString" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click='tabClicked'>
        <el-tab-pane name = '0' label='Basic info'>
          <el-form-item label="Name: " prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="Price: " prop="goods_price">
            <el-input v-model="addForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="Weight: " prop="goods_weight">
            <el-input v-model="addForm.goods_weight" type="number"></el-input>
          </el-form-item>
          <el-form-item label="Quantity: " prop="goods_number">
            <el-input v-model="addForm.goods_number" type="number"></el-input>
          </el-form-item>
          <el-form-item label="Category: " prop="goods_cat">
            <el-cascader
              v-model="addForm.goods_cat"
              :options="categoryList"
              :props="categoryProps"
              @change="handleCategoryCascaderChange"
            >
            </el-cascader>
            </el-form-item>
        </el-tab-pane>
        <el-tab-pane name = '1' label='Parameters'>
          <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox :label="name" v-for="(name,i) in item.attr_vals" :key='i' border size="small"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane name = '2' label='Properties'>
          <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane name = '3' label='Images'>
          <!-- :action: Backend API -->
          <el-upload
          :action="uploadImageURL"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          list-type="picture"
          :headers="headersObj"
          :on-success="handleSuccess">
            <el-button size="small" type="primary">Upload</el-button>
            <div slot="tip" class="el-upload__tip">Only jpg and png files are accepted, size must be smaller than 500kb</div>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane name = '4' label='Contents'>
          <quill-editor v-model="addForm.goods_introduce"></quill-editor>
          <el-button type="primary" class="btnAdd" @click="addNewGood()">Add Good</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-form>
    </el-card>
    <el-dialog
      title="Image Preview"
      :visible.sync="previewVisible"
      width="50%"
      >
      <img :src="prveiewPath" alt="previewImg" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      uploadImageURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      stepActiveIndexString: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
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
        }],
        goods_cat: [{
          required: true, message: 'Please input good\'s category', trigger: 'blur'
        }]
      },
      categoryList: [],
      categoryProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      onlyTableData: [],
      manyTableData: [],
      headersObj: { Authorization: window.sessionStorage.getItem('token') },
      prveiewPath: '',
      previewVisible: false
    }
  },
  computed: {
    stepActiveIndex: function () {
      return parseInt(this.stepActiveIndexString)
    },
    categoryID: function () {
      return this.addForm.goods_cat.length === 3 ? this.addForm.goods_cat[2] : null
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('Fail to get category list!')
      }
      this.categoryList = res.data
    },
    handleCategoryCascaderChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$message.error('You mush select level 3 categories!')
      }
    },
    beforeTabLeave (newStepIndex, oldStepIndex) {
      if (oldStepIndex === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('Please select good\'s category!')
        return false
      }
    },
    async tabClicked () {
      if (this.stepActiveIndex === 1) {
        const { data: res } = await this.$http.get(`categories/${this.categoryID}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('Fail to get categories\' parameters!')
        }
        console.log(res)
        res.data.forEach(item => {
          if (item.attr_vals.length === 0) {
            item.attr_vals = []
          } else {
            item.attr_vals = item.attr_vals.split(' ')
          }
        })
        this.manyTableData = res.data
      } else if (this.stepActiveIndex === 2) {
        const { data: res } = await this.$http.get(`categories/${this.categoryID}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('Fail to get categories\' properties!')
        }
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    handlePreview (file) {
      this.prveiewPath = file.response.data.url
      this.previewVisible = true
    },
    handleRemove (file) {
      const filePath = file.response.data.tmp_path
      const index = this.addForm.pics.findIndex(x => x.pic === filePath)
      this.addForm.pics.splice(index, 1)
    },
    handleSuccess (response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    async addNewGood () {
      this.$refs.addFormRef.validate(valid => {
        if (!valid) {
          return this.$message.error('Please enter all compulsory form items!')
        }
      })
      console.log(this.addForm)
      this.addForm.goods_cat = this.addForm.goods_cat.join(',')
      console.log(this.addForm)
      this.manyTableData.forEach(item => {
        const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
        this.addForm.attrs.push(newInfo)
      })
      this.onlyTableData.forEach(item => {
        const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
        this.addForm.attrs.push(newInfo)
      })
      const { data: res } = await this.$http.post('goods', this.addForm)
      if (res.meta.status !== 201) {
        return this.$message.error('Fail to add new good!')
      }
      this.$message.success('New good is added!')
      this.$router.push('/goods')
    }
  }
}
</script>

<style lang="less" scoped>
 .el-checkbox {
    margin: 0 10px 0 0 !important;
 }
 .previewImg {
   width: 100%;
 }
 .btnAdd {
   margin-top: 15px;
 }
</style>
