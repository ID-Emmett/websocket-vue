<template>
  <div class="home">
    显示时间<input type="checkbox" v-model="showTime" />
    &nbsp;
    <input type="text" placeholder="输入昵称" v-model="username" :disabled="disabled" style="width: 100px" />
    &nbsp;
    <input type="text" placeholder="输入信息" v-model="message" @keyup.enter="confirmSend" />
    &nbsp;
    <button @click="confirmSend">发送</button>
    <br />
    <br />
    <div class="msg-content">
      <div v-for="(item, index) in msgList" :key="index">
        <div v-if="item.username === username" class="msg-right">
          <div>
            <div class="my-msg pseudo-right">{{ item.msg }}</div>
            <div v-show="showTime" class="my-time">{{ item.time }}</div>
          </div>
          <div class="user-img">
            <img src="../assets/images/userimg.jpg" alt="" />
          </div>
        </div>
        <div v-else class="msg-left">
          <div class="user-img user-img-left">
            <img src="../assets/images/userimg.jpg" alt="" />
          </div>
          <div>
            <div class="other-name">{{ item.username }}</div>
            <div class="my-msg other-msg">{{ item.msg }}</div>
            <div v-show="showTime" class="my-time other-time">{{ item.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
const ws = new WebSocket('ws://192.168.1.6:8888')

export default {
  name: 'Home',
  data() {
    return {
      username: '',
      disabled: false,
      message: '',
      msgList: [],
      showTime: true
    }
  },
  components: {},
  mounted() {
    ws.addEventListener('open', this.onOpen.bind(this), false)
    ws.addEventListener('close', this.onClose.bind(this), false)
    ws.addEventListener('error', this.onError.bind(this), false)
    ws.addEventListener('message', this.onMessage.bind(this), false)
  },
  methods: {
    confirmSend() {
      if (!this.username) {
        alert('昵称未定义')
        return
      }
      if (!this.message.trim()) return
      ws.send(
        JSON.stringify({
          msg: this.message,
          time: new Date().getTime(),
          username: this.username
        })
      )
      console.log('发送完毕')
      this.disabled = true
      this.message = ''
    },
    onOpen(e) {
      console.log('onOpen', e)
    },
    onClose(e) {
      console.log('onClose', e)
    },
    onError(e) {
      console.log('onError', e)
    },
    onMessage(e) {
      console.log('onMessage<收到数据>')
      const data = JSON.parse(e.data)
      console.log(data)
      data.time = this.dateFormat(data.time, 'H:I:S')
      this.msgList.push(data)
    },
    // 转化时间戳
    /**
     * 日期格式化
     * @param Number time 时间戳
     * @param String format 格式  'Y-M-D H:I:S'
     */
    dateFormat(time, format) {
      const t = new Date(time)
      // 日期格式
      format = format || 'Y-m-d h:i:s'
      let year = t.getFullYear()
      // 由于 getMonth 返回值会比正常月份小 1
      let month = t.getMonth() + 1
      let day = t.getDate()
      let hours = t.getHours()
      let minutes = t.getMinutes()
      let seconds = t.getSeconds()

      const hash = {
        y: year,
        m: month,
        d: day,
        h: hours,
        i: minutes,
        s: seconds
      }
      // 是否补 0
      const isAddZero = (o) => {
        return /M|D|H|I|S/.test(o)
      }
      return format.replace(/\w/g, (o) => {
        let rt = hash[o.toLocaleLowerCase()]
        return rt > 10 || !isAddZero(o) ? rt : `0${rt}`
      })
    }
  }
}
</script>
<style scoped>
.msg-content {
  width: 400px;
  min-height: 700px;
  border: 1px solid #000;
  padding: 10px;
  background: #f5f5f5;
}

/* 优化结构 */
.msg-right {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.my-msg {
  text-align: start;
  font-size: 14px;
  font-family: Helvetica, sans-serif;
  padding: 8px 8px;
  background: #9eea6a;
  border-radius: 2px;
  max-width: 200px;
  margin-bottom: 8px;
  position: relative;
}
.my-time {
  text-align: end;
  font-size: 12px;
  color: rgb(129, 121, 121);
  margin-bottom: 8px;
}
.msg-left {
  display: flex;
}
.other-name {
  font-size: 13px;
  color: #b2b2b2;
  margin-bottom: 4px;
}
.other-msg {
  background: #fff;
  border: 1px solid rgb(245, 240, 240);
}
.other-time {
  text-align: start;
}
.user-img {
  width: 35px;
  height: 35px;
  overflow: hidden;
  margin: 0px 8px;
}
.user-img img {
  width: 100%;
  height: 100%;
}
.user-img-left {
  margin-top: 10px;
}
.pseudo-right::before {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: #9eea6a;
  right: -2px;
  top: 8px;
  transform: rotate(45deg);
}
.other-msg::before {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: #fff;
  left: -2px;
  top: 8px;
  transform: rotate(45deg);
}
</style>
