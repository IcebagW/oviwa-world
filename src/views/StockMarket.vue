<template>
  <div class="market-page">
    <!-- 💰 资产总览 -->
    <div class="wealth-bar">
      <div class="wealth-item">
        <span class="wealth-label">💰 可用 Viwa币</span>
        <span class="wealth-value">{{ formatCoins(user.viwaCoins) }}</span>
      </div>
      <div class="wealth-item">
        <span class="wealth-label">📊 持仓市值</span>
        <span class="wealth-value">{{ formatCoins(portfolioValue) }}</span>
      </div>
      <div class="wealth-item">
        <span class="wealth-label">🏦 总资产</span>
        <span class="wealth-value total">{{ formatCoins(user.viwaCoins + portfolioValue) }}</span>
      </div>
    </div>

    <!-- 📋 股票列表 -->
    <div class="stock-list">
      <div
        v-for="stock in stocks"
        :key="stock._id"
        class="stock-card"
        :class="{ up: stock.changePercent >= 0, down: stock.changePercent < 0 }"
      >
        <div class="stock-main" @click="toggleDetail(stock._id)">
          <div class="stock-info">
            <span class="stock-symbol">{{ stock.symbol }}</span>
            <span class="stock-name">{{ stock.name }}</span>
          </div>
          <div class="stock-price-info">
            <span class="stock-price">{{ stock.price.toFixed(2) }}</span>
            <span class="stock-change" :class="{ up: stock.changePercent >= 0, down: stock.changePercent < 0 }">
              {{ stock.changePercent >= 0 ? '▲' : '▼' }} {{ Math.abs(stock.changePercent).toFixed(2) }}%
            </span>
          </div>
        </div>

        <!-- 持仓信息 -->
        <div v-if="stock.shares > 0" class="holding-info">
          持有 <strong>{{ stock.shares }}</strong> 股 · 成本 {{ stock.avgCost.toFixed(2) }}
          <span :class="stock.price >= stock.avgCost ? 'profit' : 'loss'">
            ({{ stock.price >= stock.avgCost ? '+' : '' }}{{ ((stock.price - stock.avgCost) * stock.shares).toFixed(2) }})
          </span>
        </div>

        <!-- 展开的买卖面板 -->
        <div v-if="expandedId === stock._id" class="trade-panel">
          <div class="trade-row">
            <div class="trade-input-group">
              <label>数量</label>
              <div class="input-with-btns">
                <button class="qty-btn" @click="decrementQty(stock._id)" :disabled="(tradeQty[stock._id] || 1) <= 1">−</button>
                <input v-model.number="tradeQty[stock._id]" type="number" min="1" max="9999" class="qty-input" />
                <button class="qty-btn" @click="incrementQty(stock._id)">+</button>
              </div>
            </div>
            <div class="trade-cost">
              预计 <strong>{{ ((tradeQty[stock._id] || 1) * stock.price).toFixed(2) }}</strong> Viwa币
            </div>
          </div>
          <div class="trade-actions">
            <button class="btn btn-buy" @click="buyStock(stock)" :disabled="loading">
              🟢 买入
            </button>
            <button
              class="btn btn-sell"
              @click="sellStock(stock)"
              :disabled="loading || stock.shares <= 0"
            >
              🔴 卖出
            </button>
          </div>
          <div v-if="tradeMsg[stock._id]" class="trade-msg" :class="{ error: tradeMsgErr[stock._id] }">
            {{ tradeMsg[stock._id] }}
          </div>

          <!-- 迷你 K 线图 -->
          <div class="mini-chart" v-if="stock.priceHistory && stock.priceHistory.length > 1">
            <div
              v-for="(p, i) in stock.priceHistory"
              :key="i"
              class="chart-bar"
              :style="{ height: chartBarHeight(p.price, stock.priceHistory) + '%' }"
              :class="i > 0 && p.price >= stock.priceHistory[i-1].price ? 'up' : 'down'"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="stocks.length === 0 && !loading" class="empty">
      📈 加载股票数据中...
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../store/user.js'
import { stockAPI } from '../api/client.js'

export default {
  name: 'StockMarket',
  setup() {
    const userStore = useUserStore()
    const user = computed(() => userStore.user)
    const stocks = ref([])
    const loading = ref(false)
    const expandedId = ref(null)
    const tradeQty = ref({})
    const tradeMsg = ref({})
    const tradeMsgErr = ref({})
    let refreshTimer = null

    const portfolioValue = computed(() => {
      let total = 0
      for (const s of stocks.value) {
        if (s.shares > 0) {
          total += s.price * s.shares
        }
      }
      return total
    })

    const formatCoins = (val) => {
      return (val || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const chartBarHeight = (price, history) => {
      const prices = history.map(p => p.price)
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      if (max === min) return 50
      return ((price - min) / (max - min)) * 60 + 20
    }

    const toggleDetail = (id) => {
      expandedId.value = expandedId.value === id ? null : id
      if (!tradeQty.value[id]) {
        tradeQty.value[id] = 1
      }
      // 清除旧消息
      tradeMsg.value = {}
      tradeMsgErr.value = {}
    }

    const incrementQty = (id) => {
      tradeQty.value[id] = (tradeQty.value[id] || 1) + 1
    }

    const decrementQty = (id) => {
      if ((tradeQty.value[id] || 1) > 1) {
        tradeQty.value[id] = (tradeQty.value[id] || 1) - 1
      }
    }

    const fetchStocks = async () => {
      try {
        const res = await stockAPI.getAll()
        stocks.value = res.data.stocks
        // 同步用户 Viwa币
        if (res.data.viwaCoins !== undefined) {
          userStore.user.viwaCoins = res.data.viwaCoins
        }
      } catch (err) {
        console.error('获取股票失败:', err)
      }
    }

    const buyStock = async (stock) => {
      loading.value = true
      const qty = tradeQty.value[stock._id] || 1
      try {
        const res = await stockAPI.buy(stock._id, qty)
        tradeMsg.value[stock._id] = res.data.message
        tradeMsgErr.value[stock._id] = false
        userStore.user.viwaCoins = res.data.viwaCoins
        // 更新本地持仓
        await fetchStocks()
      } catch (err) {
        tradeMsg.value[stock._id] = err.response?.data?.error || '买入失败'
        tradeMsgErr.value[stock._id] = true
      } finally {
        loading.value = false
        setTimeout(() => { tradeMsg.value[stock._id] = '' }, 4000)
      }
    }

    const sellStock = async (stock) => {
      loading.value = true
      const qty = tradeQty.value[stock._id] || 1
      try {
        const res = await stockAPI.sell(stock._id, qty)
        tradeMsg.value[stock._id] = res.data.message
        tradeMsgErr.value[stock._id] = false
        userStore.user.viwaCoins = res.data.viwaCoins
        await fetchStocks()
      } catch (err) {
        tradeMsg.value[stock._id] = err.response?.data?.error || '卖出失败'
        tradeMsgErr.value[stock._id] = true
      } finally {
        loading.value = false
        setTimeout(() => { tradeMsg.value[stock._id] = '' }, 4000)
      }
    }

    onMounted(async () => {
      await fetchStocks()
      // 每10秒刷新股价
      refreshTimer = setInterval(fetchStocks, 10000)
    })

    onUnmounted(() => {
      if (refreshTimer) clearInterval(refreshTimer)
    })

    return {
      user, stocks, loading, expandedId, tradeQty,
      tradeMsg, tradeMsgErr, portfolioValue,
      formatCoins, chartBarHeight,
      toggleDetail, incrementQty, decrementQty,
      buyStock, sellStock
    }
  }
}
</script>

<style scoped>
.market-page {
  max-width: 640px;
  margin: 20px auto;
  padding: 0 16px 60px;
}

/* 💰 资产总览 */
.wealth-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.wealth-item {
  flex: 1;
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 14px;
  text-align: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.05);
}

.wealth-label {
  display: block;
  font-size: 0.72rem;
  color: #888;
  margin-bottom: 4px;
}

.wealth-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #3a5a40;
}

.wealth-value.total {
  color: #7ec8a5;
  font-size: 1.2rem;
}

/* 📋 股票卡片 */
.stock-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stock-card {
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.05);
  border-left: 5px solid #ccc;
  transition: all 0.3s;
}

.stock-card.up {
  border-left-color: #7ec8a5;
}

.stock-card.down {
  border-left-color: #ff8fab;
}

.stock-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.stock-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stock-symbol {
  font-size: 1.15rem;
  font-weight: 700;
  color: #3a5a40;
}

.stock-name {
  font-size: 0.8rem;
  color: #999;
}

.stock-price-info {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stock-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #3a5a40;
}

.stock-change {
  font-size: 0.82rem;
  font-weight: 600;
}

.stock-change.up { color: #7ec8a5; }
.stock-change.down { color: #ff8fab; }

/* 持仓信息 */
.holding-info {
  margin-top: 8px;
  font-size: 0.82rem;
  color: #777;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.holding-info .profit { color: #7ec8a5; font-weight: 600; }
.holding-info .loss { color: #ff8fab; font-weight: 600; }

/* 买卖面板 */
.trade-panel {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #eee;
}

.trade-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.trade-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.trade-input-group label {
  font-size: 0.78rem;
  color: #888;
  font-weight: 500;
}

.input-with-btns {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qty-btn {
  width: 34px;
  height: 34px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  color: #3a5a40;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover:not(:disabled) {
  border-color: #7ec8a5;
  background: #f0faf4;
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-input {
  width: 70px;
  height: 34px;
  text-align: center;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  color: #3a5a40;
  background: white;
  -moz-appearance: textfield;
}

.qty-input::-webkit-inner-spin-button,
.qty-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.qty-input:focus {
  outline: none;
  border-color: #7ec8a5;
}

.trade-cost {
  font-size: 0.85rem;
  color: #888;
}

.trade-cost strong {
  color: #3a5a40;
}

.trade-actions {
  display: flex;
  gap: 10px;
}

.btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-buy {
  background: linear-gradient(135deg, #7ec8a5, #5eb3a6);
}

.btn-buy:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 14px rgba(126,200,165,0.3);
}

.btn-sell {
  background: linear-gradient(135deg, #ff8fab, #ff6b6b);
}

.btn-sell:hover:not(:disabled) {
  transform: scale(1.02);
  box-shadow: 0 4px 14px rgba(255,143,171,0.3);
}

.trade-msg {
  margin-top: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #7ec8a5;
  text-align: center;
}

.trade-msg.error {
  color: #ff6b6b;
}

/* 📊 迷你图表 */
.mini-chart {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 50px;
  margin-top: 14px;
  padding: 6px 4px;
  background: rgba(0,0,0,0.02);
  border-radius: 8px;
}

.chart-bar {
  flex: 1;
  border-radius: 2px 2px 0 0;
  min-height: 4px;
  transition: height 0.3s;
}

.chart-bar.up {
  background: #7ec8a5;
}

.chart-bar.down {
  background: #ff8fab;
}

.empty {
  text-align: center;
  color: #999;
  margin-top: 60px;
  font-size: 1.1rem;
}

/* 📱 响应式 */
@media (max-width: 600px) {
  .wealth-bar {
    flex-direction: column;
    gap: 6px;
  }
  .wealth-item {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .wealth-label { margin-bottom: 0; }
  .stock-price { font-size: 1.1rem; }
  .trade-row { flex-direction: column; align-items: stretch; }
  .trade-cost { text-align: center; }
}
</style>
