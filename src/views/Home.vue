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
    <button @click="theEnd">结束</button>
    &nbsp;
    <button @click="theStart">重连</button>
    <span>在线人数 {{ onlineUsers }}</span>
    <br />
    <div class="msg-content">
      <div v-for="(item, index) in msgList" :key="index">
        <div v-if="item.login || item.exit" class="message-box">
          <span>{{ item.login ? '登录:' : '退出:' }} {{ item.username }}</span>
        </div>
        <div v-else>
          <div v-if="item.username === username" class="msg-right">
            <div>
              <div class="my-msg pseudo-right">{{ item.msg }}</div>
              <div v-show="showTime" class="my-time">{{ item.time }}</div>
            </div>
            <div class="user-img">
              <img src="../assets/images/userimg.jpg" alt="" />
            </div>
          </div>
          <div v-if="item.username !== username" class="msg-left">
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
  </div>
</template>

<script>
import { dateFormat } from '../util/dateFormat'

// @ is an alias to /src
// const ws = new WebSocket('ws://192.168.1.6:8888')

export default {
  name: 'Home',
  data() {
    return {
      username: '',
      message: 'hello rookie',
      disabled: false,
      showTime: true,
      close: true,
      msgList: [],
      onlineUsers: '正在查找',
    }
  },
  created() {
    this.username = 'ID-' + (Math.random() * 10).toFixed(1)
    this.initWebSocket()
  },
  destroyed() {
    this.close = false
    this.websock.close()
  },
  mounted() {},
  methods: {
    confirmSend() {
      if (!this.username) {
        alert('昵称未定义')
        return
      }
      if (!this.message.trim()) return
      this.websocketSend(
        JSON.stringify({
          msg: this.message,
          time: new Date().getTime(),
          username: this.username,
          connect: 1
        })
      )
      this.disabled = true
      this.message = ''
    },
    theEnd() {
      this.close = false
      this.websock.close()
      this.onlineUsers = '已退出'
    },
    theStart() {
      this.close = true
      this.websock.close()
      this.onlineUsers = '重连中'
      this.reconnect()
    },
    initWebSocket: function () {
      // WebSocket与普通的请求所用协议有所不同，ws等同于http，wss等同于https
      console.log('调用了链接websock')
      let userId = this.username
      // var url = window._CONFIG['domianURL'].replace('https://', 'wss://').replace('http://', 'ws://') + '/websocket/' + userId
      // const url = 'ws://192.168.1.3:8888/websocket/' + userId
      const url = 'ws://localhost:8888/websocket/' + userId
      console.log(url)
      this.websock = new WebSocket(url)
      this.websock.onopen = this.websocketOnopen
      this.websock.onerror = this.websocketOnerror
      this.websock.onmessage = this.websocketOnmessage
      this.websock.onclose = this.websocketOnclose
    },
    websocketOnopen: function () {
      console.log('WebSocket连接成功')
      //心跳检测重置
      //this.heartCheck.reset().start();

      // 连接成功后发送用户名给服务器
      this.websocketSend(
        JSON.stringify({
          login: 1,
          username: this.username
        })
      )
    },
    websocketOnerror: function (e) {
      console.log('WebSocket连接发生错误')
      this.reconnect()
    },
    websocketOnmessage: function (e) {
      // console.log(e.data)
      console.log('-----接收消息-------')
      // const data = eval('(' + e.data + ')') //解析对象
      const data = JSON.parse(e.data)
      console.log(data)

      // 判断有该属性时赋值并渲染对话列表
      if (data.hasOwnProperty('connect')) {
        data.time = dateFormat(data.time, 'H:I')
        this.msgList.push(data)
      }
      // 登录广播回来的数据
      if (data.hasOwnProperty('login')) {
        this.msgList.push(data)
      }
      // 退出广播返回的数据
      if (data.hasOwnProperty('exit')) {
        this.msgList.push(data)
        console.log(data);
      }

      this.onlineUsers = data.onlineUsers // 每次交互刷新在线人数
    },
    websocketOnclose: function (e) {
      console.log('连接关闭 (' + e.code + ')')
      console.log(this.close)
      if (!this.close) return
      this.reconnect()
    },
    websocketSend(text) {
      // 数据发送
      try {
        // if (this.websock.readyState !== WebSocket.OPEN) return
        // this.websock.send(text)
        switch (this.websock.readyState) {
          case WebSocket.OPEN:
            this.websock.send(text)
            break;
        
          case WebSocket.CONNECTING:
            console.log('正在连接中，对应的值为 0');
            break;
        
          case WebSocket.CLOSING:
            console.log('连接正在关闭，对应的值为 2');
            break;
           
          case WebSocket.CLOSED:
            console.log('连接已关闭或者没有连接成功，对应的值为 3');
            break;
        
          default:
            console.log('未知状态',this.websock.readyState);
            break;
        }


      } catch (err) {
        console.log('send failed (' + err.code + ')')
      }
    },

    reconnect() {
      if (this.lockReconnect) return
      this.lockReconnect = true
      // 没连接上会一直重连，设置延迟避免请求过多
      setTimeout(() => {
        console.info('尝试重连...')
        this.initWebSocket()
        this.lockReconnect = false
      }, 2000)
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
/* 进入离开信息 */
.message-box {
  display: flex;
  justify-content: center;
  align-items: center;
}
.message-box span {
  text-align: center;
  padding: 4px;
  background-color: #e8e8e8;
  border-radius: 4px;
  font-size: 12px;
  color: #797979;
  margin-bottom:4px;
}
</style>
