<script>
import * as api from '@/api/pushData'

export default {
  name: 'BrandList',
  components: {},
  data() {
    return {
      searchLoading: false,
      collapse: true,
      collapseHeight: 60,
      brandData: [],
      pageNum: 1, // 当前页
      pageSize: 12, // 页大小
      // activeName: 'brand', // 手风琴效果，默认展开1
      total: 0,
      brandInfoIndex: '',
      // 搜索项表单
      searchForm: {
        brandType: '',
        brandState: '',
        address: '',
      },
    }
  },
  watch: {},
  created() {},
  mounted() {
  },
  activated() {
    this.brandShow()
  },
  methods: {
    submitSearch() {
      this.brandShow()
    },
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.brandShow()
    },
    initialize(i, brandInfo, cmd, data) {
      const apiList = ['scopeGoods', 'scopePush', 'calcPush']
      api[apiList[i]]({
        bsCode: `GDY-${brandInfo.id}`,
        orgId: '10000',
        ...data,
      }, cmd)
        .then((res) => {
          this.$message.success('初始化成功')
        })
        .catch(() => {
          this.$message.error('初始化失败')
        })
    },
    showActive(num, item) {
      item.select = num
    },
    // 品牌列表
    brandShow() {
      const loading = this.$loading({
        lock: true,
        text: '小易拼命加载中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
        target: document.querySelector('.content'),
      })
      const _this = this
      const con = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        ...this.searchForm,
      }
      const jsonParam = _this.GLOBAL.g_paramJson(con)
      // // console.log('获取品牌注册列表参数',con)
      _this.$axios.post(`${_this.GLOBAL.system_manager_server}/brand/getBrandList`, jsonParam).then((res) => {
        loading.close()
        if (res.data.head.status == 0) {
          _this.brandData = res.data.body.brandList
          _this.total = res.data.body.count
          for (let i = 0; i < _this.brandData.length; i++) {
            this.$set(_this.brandData[i], 'select', 1)
          }
        }
        else {
          _this.$message({
            message: res.data.head.msg,
            type: 'warning',
          })
        }
      })
    },
    // 新增品牌
    addBrand() {
      this.$router.push({
        path: '/brand/addBrand',
      })
    },
    // 编辑品牌
    editBrand(item) {
      // // console.log(item)
      const object = item.brandInfo
      object.contacts = object.contacts ? object.contacts : ''
      object.mailbox = object.mailbox ? object.mailbox : ''
      object.telephone = object.telephone ? object.telephone : ''

      this.$router.push({
        path: '/brand/editBrand',
        query: {
          item: object,
        },
      })
    },
    // 删除品牌
    delBrand(item) {
      this.$confirm('确认删除该品牌信息吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        const _this = this
        const con = {
          brandId: item.brandInfo.id,
        }
        const jsonParam = _this.GLOBAL.g_paramJson(con)
        // // console.log('删除品牌参数',con)
        _this.$axios.post(`${_this.GLOBAL.system_manager_server}/brand/deleteBrandInfo`, jsonParam).then((res) => {
          if (res.data.head.status == 0) {
            _this.$message({
              message: res.data.head.msg,
              type: 'success',
            })
            this.brandShow()
          }
          else {
            _this.$message({
              message: res.data.head.msg,
              type: 'warning',
            })
          }
        })
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.brandShow()
    },
    handleCurrentChange(val) {
      this.pageNum = val
      this.brandShow()
    },
    // handleClick(tab, e) {
    //   console.log(this.activeName)
    // },
  },
}
</script>

<template>
  <div id="brandList" class="pageCommonStyle page-container text-sm">
    <!-- 列表搜索项 -->
    <div
      class="flex justify-between flex-wrap px-4 pt-3 mb-3 border rounded-md overflow-hidden"
      :style="{
        height: collapse ? `${collapseHeight}px` : 'auto',
      }"
    >
      <el-form ref="searchForm" :inline="true" :model="searchForm" size="small" class="demo-form-inline flex-1 grid grid-cols-3">
        <el-form-item label="品牌" prop="brandType">
          <el-select v-model="searchForm.brandType" placeholder="请选择品牌类型">
            <el-option label="品牌" value="0" />
            <el-option label="商场" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="brandState">
          <el-select v-model="searchForm.brandState" placeholder="请选择品牌状态">
            <el-option label="不可用" value="0" />
            <el-option label="可用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="searchForm.address" placeholder="请输入地址" />
        </el-form-item>
      </el-form>
      <div class="query-form__action">
        <el-button icon="el-icon-search" type="primary" size="mini" :loading="searchLoading" @click="submitSearch">
          搜索
        </el-button>
        <el-button size="mini" @click="resetSearch">
          重置
        </el-button>
        <el-button type="text" :auto-insert-space="false" :icon="collapse ? 'el-icon-caret-bottom' : 'el-icon-caret-top'" class="text-xs" size="mini" @click="collapse = !collapse">
          {{ collapse ? '展开' : '收起' }}
        </el-button>
      </div>
    </div>
    <div class="operateBtn">
      <el-button class="addBtnOnly" size="small" icon="el-icon-plus" type="success" @click="addBrand()">
        新增品牌
      </el-button>
    </div>
    <!--    <el-divider /> -->
    <!-- <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="品牌" name="brand">
        品牌
      </el-tab-pane>
      <el-tab-pane label="商场" name="mall">
        配置管理
      </el-tab-pane>
    </el-tabs> -->

    <div class="content_body">
      <div class="content">
        <div
          v-for="(item, index) in brandData"
          :key="index"
          class="box-card text-sm"
          :class="item.brandInfo.brandState ? 'cardActive' : ''"
        >
          <div class="content_title">
            <img v-if="item.brandInfo.brandLogo" class="imgLogo" :src="item.brandInfo.brandLogo" alt="">
            <div style="width:100%;word-break:break-all;">
              {{ item.brandInfo.brandName }}
            </div>
          </div>
          <div class="content_list">
            <div class="list_tit">
              <div class="list_con">
                <div class="tit" :class="item.select == 1 ? 'active' : ''" @click="showActive(1, item)">
                  数据统计
                </div>
                <div class="tit" :class="item.select == 2 ? 'active' : ''" @click="showActive(2, item)">
                  品牌信息
                </div>
                <div class="tit" :class="item.select == 3 ? 'active' : ''" @click="showActive(3, item)">
                  品牌配置
                </div>
              </div>
              <div class="list_btn">
                <el-tooltip class="item li" effect="dark" content="编辑品牌" placement="top">
                  <i class="el-icon-edit editBtn" size="mini" type="primary" circle @click="editBrand(item)" />
                </el-tooltip>
                <div class="delete el-icon-close" @click="delBrand(item)" />
              </div>
            </div>
            <div v-if="item.select == 1" class="list_list_box">
              <div class="divBox">
                <div class="divL">
                  APP
                </div>
                <div class="divR">
                  ({{ item.reportFormVO.appUserCount }})
                </div>
              </div>
              <div class="divBox">
                <div class="divL">
                  HOME
                </div>
                <div class="divR">
                  ({{ item.reportFormVO.cmsUserCount }})
                </div>
              </div>
              <div class="divBox">
                <div class="divL">
                  A+H
                </div>
                <div class="divR">
                  ({{ item.reportFormVO.cmsAndAppCount }})
                </div>
              </div>
              <div class="divBox">
                <div class="divL">
                  店铺
                </div>
                <div class="divR">
                  ({{ item.reportFormVO.shopCount }})
                </div>
              </div>
              <div class="divBox">
                <div class="divL">
                  区域
                </div>
                <div class="divR">
                  ({{ item.reportFormVO.orgCount }})
                </div>
              </div>
            </div>
            <div v-if="item.select == 2" class="list_list">
              <div class="divH">
                <div class="divL">
                  品牌名称：
                </div>
                <div class="divR">
                  {{ item.brandInfo.brandName }}
                </div>
              </div>
              <div class="divH">
                <div class="divL">
                  品牌简称：
                </div>
                <div class="divR">
                  {{ item.brandInfo.abbreviation }}
                </div>
              </div>
              <div class="divH">
                <div class="divL">
                  所属行业：
                </div>
                <div class="divR">
                  {{ item.brandInfo.industryName }}
                </div>
              </div>
              <div class="divH">
                <div class="divL">
                  所属类型：
                </div>
                <div class="divR">
                  {{ item.brandInfo.brandTypeName }}
                </div>
              </div>
              <div class="divH">
                <div class="divL">
                  管理员账号：
                </div>
                <div class="divR">
                  {{ (item.adminInfo).join(' | ') }}
                </div>
              </div>
              <div class="divH">
                <div class="divL">
                  品牌邮箱：
                </div>
                <div class="divR">
                  {{ item.brandInfo.mailbox || '暂无' }}
                </div>
              </div>
              <div class="divH">
                <div class="divL">
                  品牌状态：
                </div>
                <div class="divR">
                  {{ item.brandInfo.brandState ? '关闭' : '开启' }}
                </div>
              </div>
              <div class="divH">
                <div class="divL">
                  品牌地址：
                </div>
                <div class="divR">
                  {{ item.brandInfo.address }}
                </div>
              </div>
              <div class="divH">
                <div class="divL">
                  品牌介绍：
                </div>
                <div class="divR">
                  {{ item.brandInfo.introduce }}
                  <!-- <el-tooltip class="item p-0" effect="dark" content="Bottom Center 提示文字" placement="bottom">
										<div class="mr-4 truncate">
											{{ item.brandInfo.introduce }}
										</div>
									</el-tooltip> -->
                </div>
              </div>
              <div class="divH">
                <div class="divL">
                  入驻时间：
                </div>
                <div class="divR">
                  {{ item.brandInfo.dueStartTime }}
                </div>
              </div>
              <div class="divH">
                <div class="divL">
                  到期时间：
                </div>
                <div class="divR">
                  {{ item.brandInfo.dueEndTime }}
                </div>
              </div>
              <div class="divH">
                <div class="divL">
                  创建时间：
                </div>
                <div class="divR">
                  {{ item.brandInfo.createTime }}
                </div>
              </div>
              <div class="divH">
                <div class="divL">
                  修改时间：
                </div>
                <div class="divR">
                  {{ item.brandInfo.updateTime }}
                </div>
              </div>
            </div>
            <div v-if="item.select == 3" class="list_list_box">
              <div class="divBox">
                <div class="divL">
                  店铺总数
                </div>
                <div class="divR">
                  ({{ item.brandInfo.totalNumShop }})
                </div>
              </div>
              <div class="divBox">
                <div class="divL">
                  S级人数
                </div>
                <div class="divR">
                  ({{ item.brandInfo.gradeS }})
                </div>
              </div>
              <div class="divBox">
                <div class="divL">
                  A级人数
                </div>
                <div class="divR">
                  ({{ item.brandInfo.gradeA }})
                </div>
              </div>
              <div class="divBox">
                <div class="divL">
                  B级人数
                </div>
                <div class="divR">
                  ({{ item.brandInfo.gradeB }})
                </div>
              </div>
              <div class="divBox">
                <div class="divL">
                  C级人数
                </div>
                <div class="divR">
                  ({{ item.brandInfo.gradeC }})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-pagination
      background
      :current-page="pageNum"
      :page-sizes="[12, 24, 36]"
      :page-size="100"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<style lang="less" scoped>
::v-deep{
  .demo-form-inline{
    .el-form-item__content{
      width: 80%;
      .el-select{
        width: 100%;
      }
    }
  }

}
@deep: ~">>>";
#brandList {
  .operateBtn {
    margin-bottom: 10px;
    display: flex;
  }

  .content_body {
    width: 100%;
    min-height: 700px;

    .content {
      width: 100%;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      .box-card {
        width: 450px;
        height: 210px;
        border-radius: 4px;
        margin-right: 15px;
        margin-bottom: 15px;
        border: 1px solid #e5e5e5;
        box-sizing: border-box;
        box-shadow: 3px 3px 15px #ccc;
        display: flex;
        flex-direction: row;

        .content_title {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          width: 25%;
          border-right: 1px solid #e5e5e5;
          padding: 10px;
          box-sizing: border-box;

          .imgLogo {
            width: 40px;
            height: 40px;
            border-radius: 20px;
            margin-bottom: 10px;
          }
        }

        .content_list {
          flex: 1;
          display: flex;
          flex-direction: column;

          .list_tit {
            height: 30px;
            display: flex;
            flex-direction: row;
            align-items: center;
            border-bottom: 1px solid #e5e5e5;

            .list_con {
              flex: 1;
              display: flex;
              flex-direction: row;

              .tit {
                height: 30px;
                line-height: 30px;
                padding: 0 10px;
              }

              .tit:hover {
                cursor: pointer
              }

              .active {
                color: #1978FE;
                border-bottom: 1px solid #1978FE;
              }
            }

            .list_btn {
              width: 60px;
              display: flex;
              flex-direction: row;
              justify-content: space-between;

              .delete {
                height: 30px;
                line-height: 30px;
                width: 30px;
              }

              .delete:hover {
                cursor: pointer;
                background: #e5e5e5;
              }

              .editBtn:hover {
                cursor: pointer;
                background: #e5e5e5;
              }
            }
          }

          .list_list {
            flex: 1;
            // height:100%;
            box-sizing: border-box;
            overflow: hidden;
            overflow: auto;
            // text-align:center;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            // align-items: center;
            padding: 0 10px;

            .divH {
              // flex: 1;
              display: flex;
              flex-direction: row;
              // align-items: center;
              // text-align:center;
              padding: 5px 0;

              .divL {
                // width:90px;
                text-align: left;
              }

              .divR {
                flex: 1;
                // line-height: 13px;
                text-align: left;
              }
            }
          }

          .list_list_box {
            // flex:1;
            box-sizing: border-box;
            overflow: hidden;
            overflow: auto;

            display: flex;
            flex-direction: row;
            align-items: flex-start;
            flex-wrap: wrap;
            padding: 10px 10px 0;

            .divBox {
              border: 1px solid #eee;
              border-radius: 10px;
              box-sizing: border-box;

              // width:100px;
              width: 70px;
              height: 70px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              padding: 5px;
              margin: 0 10px 10px 0;
              // padding:5px 0;
              .divL {
                padding: 5px 0;
                // width:90px;
                text-align: left;
              }

              .divR {
                padding: 5px 0;
                // flex:1;
                // line-height: 13px;
                text-align: left;
                color: #1978FE;
              }
            }
          }
        }
      }

      .cardActive {
        border: 1px solid #ccc;
        box-shadow: 3px 3px 15px #ccc;
      }
    }
  }

  @{deep} .el-tooltip {
    padding: 7px 8.5px !important;
  }
}
</style>

<style lang="scss" scoped>
</style>
