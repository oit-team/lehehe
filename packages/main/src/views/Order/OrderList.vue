<script>
import { alipay, dictitemInfoAllMethod, getProcurementOrderList } from '@/api/order'

export default {
  name: 'OrderList',
  data: () => ({
    data: {},
    orderStateList: [],
    newOrderSatusList: [],
  }),

  computed: {
    tablePageOption() {
      return {
        promise: this.loadData,
        search: {
          fieldProps: {
            // 订单状态
            orderState: {
              options: this.newOrderStateList,
            },
          },
        },
        table: {
          data: this.data.resultList,
          actions: {
            width: 100,
            buttons: [
              {
                tip: '详情',
                type: 'success',
                icon: 'el-icon-view',
                click: ({ row }) => this.$router.push({
                  name: 'Detail',
                  query: { orderId: row.orderId },
                }),
              },
              {
                tip: '去支付',
                type: 'warning',
                icon: 'el-icon-wallet',
                disabled: ({ row }) => row.orderState !== 0,
                click: this.submitAlipay,
              },
            ],
          },
        },
        pager: {
          total: this.data.count,
        },
      }
    },
  },
  mounted() {
    this.getOrderStateList()
  },

  methods: {
    async loadData(params) {
      const res = await getProcurementOrderList({
        ...params,
      })
      this.data = res.body
    },

    // 根据字典项查询订单状态
    async getOrderStateList() {
      const res = await dictitemInfoAllMethod({
        type: 'ORDER_STATE',
      })
      this.orderStateList = res.body.result

      this.newOrderStateList = this.orderStateList.map(item => ({
        optionKey: item.dictitemCode,
        optionValue: item.dicttimeDisplayName,
      }))
    },

    async submitAlipay({ row }) {
      const res = await alipay({
        shopId: row.shopId,
        amount: row.orderMoney,
        payNum: 1,
        returnNum: 1,
      })
      document.write(res.body.result)
    },
  },
}
</script>

<template>
  <div class="h-full">
    <div class="p-2 h-full">
      <TablePage v-bind="tablePageOption" ref="table" auto field-key="1669687596574" />
    </div>
  </div>
</template>

<style lang='scss' scoped>
</style>
