<script>
import { keyBy } from 'lodash-es'
// import { TIME_LINE_STYLE } from '../Carousel/PublicRelease.vue'
import toApprove from '@/assets/icons/toApprove.svg'
import * as api from '@/api/liveStream'
import CarouselPreview from '@/components/business/CarouselPreview'

const BOOK_STATE = {
  EMPTY: 0,
  REVIEW: 1,
  PASS: 2,
  PLAY: 3,
  PLAYED: 4,
  ERROR: 5,
  FAILED: 6,
  PAY_FAILED: 7,
}

const TIME_LINE_STYLE = {
  [BOOK_STATE.EMPTY]: {
    icon: 'el-icon-time',
    color: '#409EFF',
    type: 'el',
  },
  [BOOK_STATE.REVIEW]: {
    icon: toApprove,
    color: '#909399',
    type: 'svg',
  },
  [BOOK_STATE.PASS]: {
    icon: 'el-icon-circle-check',
    color: '#67C23A',
    type: 'el',
  },
  [BOOK_STATE.PLAY]: {
    icon: 'el-icon-video-play',
    color: '#409EFF',
    type: 'el',
  },
  [BOOK_STATE.PLAYED]: {
    icon: 'el-icon-circle-check',
    color: '#67C23A',
    type: 'el',
  },
  [BOOK_STATE.ERROR]: {
    icon: 'el-icon-warning-outline',
    color: '#F56C6C',
    type: 'el',
  },
  [BOOK_STATE.FAILED]: {
    color: '#E6A23C',
  },
  [BOOK_STATE.PAY_FAILED]: {
    color: '#F56C6C',
  },
}

const HANDLETYPE = {
  NOHANDLE: '轮播记录',
  HANDLE: '内容审核',
}

export default {
  components: {
    CarouselPreview,
  },
  data() {
    return {
      TIME_LINE_STYLE,
      BOOK_STATE,
      HANDLETYPE,
      search: '',
      navLoading: false,
      brandList: [],
      devId: '', // 设备id
      selectContent: HANDLETYPE.NOHANDLE, // 内容展示
      nowTime: new Date(), // 当前时间
      weekList: [],
      bookList: [],
      bookMapList: [],
      moreTime: [],
      selectTime: '', // 选中的日期 2022-08-08  年月日
      defaultProps: {
        children: 'devList',
        label: 'brandName',
      },
      carouselMapCache: {},
      selectTimeList: [], // 最终提交时的数组
      previewDrawerVisible: false,
      // .....................
      nowHIndex: 0, // 当前选中的  小时
      carouselPreviewId: '',
      hourLoading: false,
      minuteLoading: false,
      brandId: null,
    }
  },
  computed: {
    searchList() {
      return this.brandList.filter(item => item.brandName.includes(this.search))
    },
  },
  watch: {
    selectTime() {
      this.moreTime = []
      this.nowHIndex = 0
      this.getIntervalHourConfig()
    },
    bookList() {
      this.bookMapList = []
      this.bookList.forEach((item) => {
        const obj = JSON.parse(JSON.stringify(item))
        obj.startTime = item.startTime.substring(item.startTime.indexOf(' ') + 1, item.startTime.length)
        obj.endTime = item.endTime.substring(item.endTime.indexOf(' ') + 1, item.endTime.length)
        this.bookMapList.push(obj)
      })
    },
    devId() {
      this.getDateToWeek()
    },
  },

  async activated() {
    await this.getBrandList()
  },
  methods: {
    async getBrandList() {
      this.navLoading = true
      const res = await api.getContextDeviceList()
      this.brandList = res.body.resultList
      this.navLoading = false
    },
    async getDateToWeek() {
      const res = await api.getDateToWeek({
        time: this.nowTime,
        brandId: this.brandId,
      })
      this.selectTime = `${this.nowTime.getFullYear()}-${this.nowTime.getMonth() + 1 < 10 ? `0${this.nowTime.getMonth() + 1}` : this.nowTime.getMonth() + 1}-${this.nowTime.getDate() < 10 ? `0${this.nowTime.getDate()}` : this.nowTime.getDate()}`
      this.weekList = res.body.resultList
    },
    async getIntervalHourConfig() {
      this.hourLoading = true
      const res = await api.getIntervalHourConfig({
        time: `${this.selectTime} 08:00:00`,
        devId: this.devId,
        brandId: this.brandId,
      }).finally(() => {
        this.hourLoading = false
      })
      this.bookList = res.body.resultList
      this.getAuditBook(this.bookList[0])
    },
    async getAuditBook(data) {
      this.minuteLoading = true
      const res = await api.getAuditBook({
        startTime: data.startTime,
        endTime: data.endTime,
        devId: this.devId,
        brandId: this.brandId,
      }).finally(() => {
        this.minuteLoading = false
      })
      res.body.resultList.forEach((item) => {
        item._configStartTime = item.configStartTime.substring(item.configStartTime.indexOf(' ') + 1, item.configStartTime.length)
        item._configEndTime = item.configEndTime.substring(item.configEndTime.indexOf(' ') + 1, item.configEndTime.length)
        this.$set(item, '_check', false)
        this.$set(item, '_open', false)
      })
      this.moreTime = res.body.resultList
    },
    // 切换设备  左侧设备菜单
    handleNodeClick(data) {
      this.brandId = data?.brandId
      if (data.devId) {
        this.devId = data.devId
      }
    },
    // 点击 左侧 小时
    changeTime(e) {
      this.nowHIndex = e
      this.getAuditBook(this.bookList[e])
    },
    // 提交审核  通过/拒绝
    async updateBookInfo(state, id) {
      if (this.selectTimeList?.length === 0 && !id) {
        this.$message.warning('请至少勾选一项！')
        return
      }
      if (state === 0) {
        this.$prompt('请限制在30字以内', '拒绝原因', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        })
          .then(async ({ value }) => {
            if (value.length > 30) return this.$message.error('请输入30字以内的内容')
            if (value && value.length <= 30) {
              await api.updateBookInfo({
                bookIds: id ? [id] : this.selectTimeList,
                bookState: state,
                devId: this.devId,
                remarks: value,
              })
              this.$message.success('提交成功')
              this.selectTimeList = []
              await this.getAuditBook(this.bookList[this.nowHIndex])
            }
          }).catch(async () => {
            this.$message({
              type: 'info',
              message: '取消输入',
            })
            // await this.getAuditBook(this.bookList[this.nowHIndex])
          })
      }
      else {
        await api.updateBookInfo({
          bookIds: id ? [id] : this.selectTimeList,
          bookState: state,
          devId: this.devId,
        })
        this.$message.success('提交成功')
        this.selectTimeList = []
        await this.getAuditBook(this.bookList[this.nowHIndex])
      }
    },
    changeCheck(e, id) {
      if (e) this.selectTimeList.push(id)
      else this.selectTimeList.splice(this.selectTimeList.indexOf(id), 1)
    },
    // 点击今天
    changeToday() {
      // 如果当前选择的日期是今天   return
      const timer = `${new Date().getFullYear()}-${new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1}-${new Date().getDate() < 10 ? `0${new Date().getDate()}` : new Date().getDate()}`
      if (this.selectTime === timer) return false
      this.nowTime = new Date()
      this.selectTime = `${this.nowTime.getFullYear()}-${this.nowTime.getMonth() + 1 < 10 ? `0${this.nowTime.getMonth() + 1}` : this.nowTime.getMonth() + 1}-${this.nowTime.getDate() < 10 ? `0${this.nowTime.getDate()}` : this.nowTime.getDate()}`
      this.getDateToWeek()
    },
    previewAds(item) {
      this.previewDrawerVisible = true
      const { advertsId } = item
      this.carouselPreviewId = advertsId
      !this.carouselMapCache[advertsId] && api.getAdvertsById({
        advId: advertsId,
      }).then((res) => {
        const item = res.body
        item.rotationRules = JSON.parse(item.rotationRules)
        item.resEntityMap = keyBy(item.resEntityList, 'id')
        this.$set(this.carouselMapCache, advertsId, item)
      })
    },
    changePickerTime(e) {
      this.selectTime = `${e.getFullYear()}-${e.getMonth() + 1 < 10 ? `0${e.getMonth() + 1}` : e.getMonth() + 1}-${e.getDate() < 10 ? `0${e.getDate()}` : e.getDate()}`
      this.getDateToWeek()
    },
  },
}
</script>

<template>
  <div class="flex page-container text-sm">
    <!--    左侧菜单 -->
    <div class="flex flex-col mr-2 mb-2 rounded-lg border brand-nav">
      <div class="flex p-1">
        <el-input v-model="search" clearable placeholder="关键字搜索" />
        <el-tooltip content="刷新" placement="top">
          <el-button class="px-3 ml-1" icon="el-icon-refresh" @click="getBrandList" />
        </el-tooltip>
      </div>
      <div v-loading="navLoading" class="overflow-y-auto flex-1">
        <el-tree
          :data="searchList"
          :props="defaultProps"
          highlight-current
          accordion
          @node-click="handleNodeClick"
        />
      </div>
    </div>

    <!--    右侧内容区 -->
    <div class="flex-1 px-2">
      <div v-if="!devId" class="w-full h-full flex items-center justify-center">
        <el-empty description="暂无数据" />
      </div>
      <div v-else class="w-full h-full flex flex-col">
        <el-radio-group v-model="selectContent">
          <el-radio-button :label="HANDLETYPE.NOHANDLE" />
          <el-radio-button :label="HANDLETYPE.HANDLE" />
        </el-radio-group>

        <el-divider />

        <div class="w-full flex justify-between mb-5 items-center">
          <el-radio-group v-model="selectTime">
            <el-radio-button
              v-for="(item, index) in weekList"
              :key="index"
              :label="item"
            />
          </el-radio-group>
          <div class="flex items-center px-2">
            <el-button type="text" class="mr-2" @click="changeToday">
              今天
            </el-button>
            <el-date-picker
              v-model="nowTime"
              type="date"
              placeholder="选择日期"
              :clearable="false"
              @change="changePickerTime"
            />
          </div>
        </div>

        <div v-if="bookMapList.length === 0" class="w-full flex-1">
          <el-empty description="暂无数据" />
        </div>
        <div v-else class="w-full flex-1 flex ">
          <div v-loading="hourLoading" class="flex flex-col px-2 gap-y-2 flex-shrink-0">
            <div
              v-for="(item, index) in bookMapList"
              :key="index"
              class="cursor-pointer p-2 box-border w-full rounded-md text-center bindHover"
              :class="nowHIndex === index ? 'bg-[#5c96fd] text-white rounded-md' : ''"
              @click="changeTime(index)"
            >
              {{ item.startTime }}(待预定：{{ item.bookStateNum || 0 }} 待审核：{{ item.auditStateNum || 0 }})
            </div>
          </div>

          <el-divider direction="vertical" class="h-full" />

          <div class="w-full">
            <div v-if="moreTime.length === 0" class="w-full text-center">
              <el-empty description="暂无数据" />
            </div>
            <div v-else v-loading="minuteLoading" class="w-full h-full cursor-pointer flex flex-col justify-between pl-4 pt-4">
              <el-timeline>
                <el-timeline-item
                  v-for="(time, id) in moreTime"
                  :key="id"
                  size="large"
                  hide-timestamp
                >
                  <template #dot>
                    <i v-if="TIME_LINE_STYLE[time.bookState].type === 'el'" :class="TIME_LINE_STYLE[time.bookState].icon" :style="{ backgroundColor: TIME_LINE_STYLE[time.bookState].color, color: '#fff', borderRadius: '50%' }" />
                    <img v-if="TIME_LINE_STYLE[time.bookState].type === 'svg'" :src="TIME_LINE_STYLE[time.bookState].icon" :style="{ backgroundColor: TIME_LINE_STYLE[time.bookState].color }" class="w-[24px] h-[24px]">
                  </template>
                  <div class="flex justify-between items-center w-4/5">
                    <div class="flex items-center flex-1">
                      <div class="flex w-1/2 items-center">
                        <el-checkbox
                          v-if="selectContent === HANDLETYPE.HANDLE"
                          v-model="time._check"
                          :disabled="time.bookState !== 1"
                          class="mx-2"
                          @change="changeCheck($event, time.bookId)"
                        />
                        <el-tag v-if="time.bookState === BOOK_STATE.EMPTY" class="mr-2">
                          待预定
                        </el-tag>
                        <el-tag v-else-if="time.bookState === BOOK_STATE.REVIEW" type="info" class="mr-2">
                          待审核
                        </el-tag>
                        <el-tag v-else-if="time.bookState === BOOK_STATE.PASS" type="success" class="mr-2">
                          已通过
                        </el-tag>
                        <el-tag v-else-if="time.bookState === BOOK_STATE.PLAY" class="mr-2" effect="dark">
                          待播放
                        </el-tag>
                        <el-tag v-else-if="time.bookState === BOOK_STATE.PLAYED" class="mr-2">
                          已播放
                        </el-tag>
                        <el-tag v-else-if="time.bookState === BOOK_STATE.ERROR" type="danger" class="mr-2">
                          发布失败
                        </el-tag>
                        <div :class="time.bookState !== BOOK_STATE.REVIEW ? 'text-[#c0c4cc]' : ''">
                          {{ `${time._configStartTime}-${time._configEndTime}` }} <span>{{ `${time.advertsName || '暂无'}(${time.shopName || '暂无'})` }}</span>
                        </div>
                        <el-button v-if="time.bookState !== BOOK_STATE.EMPTY" class="ml-4" type="text" size="mini" @click="previewAds(time)">
                          预览
                        </el-button>
                        <div v-if="time.bookState === BOOK_STATE.REVIEW && selectContent === HANDLETYPE.HANDLE" class="flex gap-2 ml-4">
                          <el-button type="success" icon="el-icon-check" size="mini" circle @click="updateBookInfo(2, time.bookId)" />
                          <el-button type="danger" icon="el-icon-close" size="mini" circle @click="updateBookInfo(0, time.bookId)" />
                        </div>
                      </div>
                    </div>
                    <div v-if="time.bookList?.length > 0" class="px-8 py-2" @click="time._open = !time._open">
                      <i v-if="time._open" class="el-icon-arrow-down" />
                      <i v-else class="el-icon-arrow-right" />
                    </div>
                  </div>

                  <div v-if="time.bookList?.length > 0 && time._open" class="w-full">
                    <div
                      v-for="(book, bookId) in time.bookList"
                      :key="bookId"
                      class="pl-16 gap-x-2 py-2"
                    >
                      <div class="w-full flex items-center">
                        <div class="flex items-center gap-4">
                          <div :style="{ color: TIME_LINE_STYLE[book.bookState]?.color }">
                            {{ book.bookstateName }}
                          </div>
                          <div>
                            {{ book.advertsName }}({{ book.shopName }})
                          </div>
                          <div>{{ book.createTime }}</div>
                        </div>
                        <el-button class="ml-4" type="text" size="mini" @click="previewAds(book)">
                          预览
                        </el-button>
                      </div>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>

              <div v-if="selectContent === HANDLETYPE.HANDLE" class="w-full p-2 box-border">
                <div class="flex justify-around w-full items-center py-4">
                  <el-button type="primary" @click="updateBookInfo(2)">
                    通过
                  </el-button>
                  <el-button type="info" @click="updateBookInfo(0)">
                    拒绝
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--  审核预览 -->
    <el-drawer :visible.sync="previewDrawerVisible" title="预览广告" size="500px">
      <div v-loading="!carouselMapCache[carouselPreviewId]" class="h-full">
        <carousel-preview
          v-if="previewDrawerVisible && carouselMapCache[carouselPreviewId]"
          :option="carouselMapCache[carouselPreviewId].rotationRules"
          :file-map="carouselMapCache[carouselPreviewId].resEntityMap"
        />
      </div>
    </el-drawer>
  </div>
</template>

<style lang='scss' scoped>
::v-deep {
  .el-button--text{
    text-decoration: underline;
  }
  .el-timeline-item__wrapper{
    top: -10px;
  }
  .el-timeline-item__dot{
    position: absolute;
    top: -6px;
    left: -6px;
  }
  .el-timeline-item__dot img{
    border-radius: 50%;
  }
  .el-timeline-item__dot i{
    font-size: 24px;
  }
}
.bindHover:hover{
    background-color: #9cc1fc;
    color: #FFFFFF;
}
</style>
