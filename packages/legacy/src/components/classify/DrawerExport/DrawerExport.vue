<script>
import { getExportInfo } from '@/api/system'

export default {
  name: 'DrawerExport',

  props: {
    type: String,
    code: String,
    /**
     * 文件名占位符"$"
     * @example
     * filename="表格 - $"
     * 结果：表格 - 文件名
     */
    filename: {
      type: String,
      default: '$',
    },
  },

  data: () => ({
    show: false,
    checkList: [],
    exportInfoList: [],
    loaded: false,
  }),

  methods: {
    loadData() {
      this.loaded = false
      getExportInfo({
        type: this.type || sessionStorage.menuCode,
        code: this.code,
      })
        .then((res) => {
          this.loaded = true
          this.exportInfoList = res.body.exportTitle
          this.checkList = [...this.exportInfoList]
        })
    },
    open() {
      this.loadData()
      this.show = true
    },
    close() {
      this.show = false
    },
    confirm() {
      const map = {}
      this.checkList.forEach(item => (map[item.columnName] = item.columnDesc))
      this.$emit('confirm', {
        rowList: map,
        download: this.download,
      })
    },
    /**
     * 下载资源
     * @param res
     */
    download(res) {
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' })
      const filename = (res.headers['content-disposition'].match(/Filename=([^;]+\.[^\.;]+);*/) || [])[1]
      const href = window.URL.createObjectURL(blob) // 创建下载的链接
      const downloadElement = document.createElement('a')
      downloadElement.href = href
      downloadElement.download = this.filename.replace('$', filename) // 下载的文件名
      downloadElement.click()
      window.URL.revokeObjectURL(href) // 释放blob对象
    },
  },
}
</script>

<template>
  <el-drawer
    title="请选择需要导出的字段"
    :visible.sync="show"
    direction="rtl"
  >
    <div class="mb-2">
      <el-button size="small" @click="checkList = [...exportInfoList]">
        全选
      </el-button>
      <el-button size="small" @click="checkList = []">
        全不选
      </el-button>
    </div>
    <el-checkbox-group v-model="checkList">
      <el-checkbox
        v-for="(item, index) of exportInfoList"
        :key="index"
        class="block mt-1"
        :label="item"
      >
        {{ item.columnDesc }}
      </el-checkbox>
    </el-checkbox-group>
    <div class="mt-4">
      <el-button @click="close">
        取 消
      </el-button>
      <el-button type="primary" :disabled="!loaded || !checkList.length" @click="confirm">
        确 认
      </el-button>
    </div>
  </el-drawer>
</template>

<style scoped>

</style>
