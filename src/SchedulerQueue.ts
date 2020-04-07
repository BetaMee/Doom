import Barrage from './Barrage';
/**
 * 队列器
 */
export default class SchedulerQueue {
    queueStore: Barrage[] = [] // 队列数据
    enqueue(q: Barrage) { // 向队列末尾添加
      this.queueStore.push(q)
    }
    dequeue = () => { // 删除首位的数据
      if(this.empty()) {
        return null
      } else {
        this.queueStore.shift()
      }
    }
    front = () => { // 查看队列首位数据
      if(this.empty()) {
        return null
      } else {
        return this.queueStore[0]
      }
    }
    back = () => {
      if(this.empty()) {
        return null
      } else {
        return this.queueStore[ this.queueStore.length - 1 ]
      }
    }
    each = (callback: (barrage: Barrage) => void) => { // 迭代队列
      this.queueStore.forEach(callback)
    }
    empty = () => { // 判断是否为空
      if(this.queueStore.length === 0) {
        return true
      } else {
        return false
      }
    }
    clear = () => { // 清空队列数据
      delete this.queueStore;
      this.queueStore = [];
    }
  }