import SchedulerQueue from './SchedulerQueue'
import Barrage from "./Barrage";

/**
 * 弹幕轨道
 */
export default class Tracker {
    _flowTrackList: { trackerNo: number; barrageQueue: SchedulerQueue }[]
    _topTrackList: { trackerNo: number; barrage: Barrage | null }[]
    _bottomTrackList: { trackerNo: number; barrage: Barrage | null }[]
    _flowBarrageQueue: SchedulerQueue
    _topBarrageQueue: SchedulerQueue
    _bottomBarrageQueue: SchedulerQueue
    _trackLength: number
    constructor({ trackCount, trackLength }: { trackCount: number, trackLength: number }) {
      // 生成流动弹幕轨道列表
      this._flowTrackList = Array.from({ length: trackCount }, (v, i) => ({
        trackerNo: i,
        barrageQueue: new SchedulerQueue()
      }))
      // 生成置顶弹幕轨道列表
      this._topTrackList = Array.from({ length: trackCount }, (v, i) => ({
        trackerNo: i,
        barrage: null
      }))
      // 生成底部弹幕轨道列表
      this._bottomTrackList = Array.from({ length: trackCount / 2 }, (v, i) => ({
        trackerNo: trackCount - i - 1,
        barrage: null
      }))
      // 流动弹幕队列
      this._flowBarrageQueue = new SchedulerQueue()
      // 置顶弹幕队列
      this._topBarrageQueue = new SchedulerQueue()
      // 底部弹幕队列
      this._bottomBarrageQueue = new SchedulerQueue()
      // 轨道宽度
      this._trackLength = trackLength
    }
    // 询问流动弹幕空闲轨道
    askFlowIdleTracker = (barrage: Barrage) => {
      for (const tracker of this._flowTrackList) {
        if (tracker.barrageQueue.empty()) {
          return tracker
        } else {
          // 轨道的最后一条弹幕数据
          const lastBarrage = tracker.barrageQueue.back()
          if (!lastBarrage) {
            return
          }
          // 判断能否发生追尾冲突，小学数学题
          const conflictTime = (this._trackLength - lastBarrage.position - lastBarrage.textWidth) / (barrage.speed - lastBarrage.speed)
          const barrageRunDistance = conflictTime * barrage.speed
          const isConflictInTracker = (this._trackLength - barrageRunDistance) <= 0
          // 是否还没完全进入轨道
          const isFullInTracker = (lastBarrage.position + lastBarrage.textWidth) < this._trackLength
          // 轨道内不冲突
          if (isConflictInTracker && isFullInTracker) {
            return tracker
          }
        }
      }
    }
    // 询问置顶弹幕空闲轨道
    askTopIdleTracker = () => {
      for (const tracker of this._topTrackList) {
        if (!tracker.barrage) {
          return tracker
        }
      }
    }
    // 询问底部弹幕空闲轨道
    askBottomIdleTracker = () => {
      for (const tracker of this._bottomTrackList) {
        if (!tracker.barrage) {
          return tracker
        }
      }
    }
    // 新增一条流动弹幕
    addToFlowBarrageQueue = (barrage: Barrage) => {
      this._flowBarrageQueue.enqueue(barrage)
    }
    // 新增一条置顶弹幕
    addToTopBarrageQueue = (barrage: Barrage) => {
      this._topBarrageQueue.enqueue(barrage)
    }
    // 新增一条底部弹幕
    addToBottomBarrageQueue = (barrage: Barrage) => {
      this._bottomBarrageQueue.enqueue(barrage)
    }
    // 重置流动轨道里的数据，将流动弹幕置入合适轨道
    reorderFlowTrackers = (schedulerTime: number) => {
      if (!this._flowBarrageQueue.empty()) {
        const selectedBarrage = this._flowBarrageQueue.front()
        if (!selectedBarrage) {
          return
        }
        // 比较能否加入轨道中
        const idleTracker = this.askFlowIdleTracker(selectedBarrage)
        if (idleTracker) {
          // 设定开始进入轨道的时间和轨道位置
          selectedBarrage.setStartTime(schedulerTime)
          selectedBarrage.setTrackerNo(idleTracker.trackerNo)
          // 置入轨道列表中
          idleTracker.barrageQueue.enqueue(selectedBarrage)
          // 删除弹幕列表中已用到的数据
          this._flowBarrageQueue.dequeue()
        } else {
          return
        }
      } else {
        return
      }
    }
    // 重置置顶轨道里的数据，将置顶弹幕置入合适轨道
    reorderTopTrackers = (schedulerTime: number) => {
    if (!this._topBarrageQueue.empty()) {
      const selectedBarrage = this._topBarrageQueue.front()
      if (!selectedBarrage) {
        return
      }
      // 比较能否加入轨道中
      const idleTracker = this.askTopIdleTracker()
      if (idleTracker) {
        // 设定开始进入轨道的时间和轨道位置
        selectedBarrage.setStartTime(schedulerTime)
        selectedBarrage.setTrackerNo(idleTracker.trackerNo)
        // 置入轨道列表中
        idleTracker.barrage = selectedBarrage
        // 删除弹幕列表中已用到的数据
        this._topBarrageQueue.dequeue()
      } else {
        return
      }
    } else {
      return
    }
    }
    // 重置底部轨道里的数据，将置顶弹幕置入合适轨道
    reorderBottomTrackers = (schedulerTime: number) => {
      if (!this._bottomBarrageQueue.empty()) {
        const selectedBarrage = this._bottomBarrageQueue.front()
        if (!selectedBarrage) {
          return
        }
        // 比较能否加入轨道中
        const idleTracker = this.askBottomIdleTracker()
        if (idleTracker) {
          // 设定开始进入轨道的时间和轨道位置
          selectedBarrage.setStartTime(schedulerTime)
          selectedBarrage.setTrackerNo(idleTracker.trackerNo)
          // 置入轨道列表中
          idleTracker.barrage = selectedBarrage
          // 删除弹幕列表中已用到的数据
          this._bottomBarrageQueue.dequeue()
        } else {
          return
        }
      } else {
        return
      }
      }
    // 重置每个流动轨道里的弹幕数据
    resetFlowTrackers = (schedulerTime: number) => {
      this._flowTrackList.forEach(tracker => {
        tracker.barrageQueue.each(barrage => {
          // 更新运行位置
          barrage.setPosition(schedulerTime)
        })
      })
    }
    // 重置每个置顶轨道里的弹幕数据
    resetTopTrackers = (schedulerTime: number) => {
      this._topTrackList.forEach(tracker => {
        if (tracker.barrage) {
          tracker.barrage.setRunTime(schedulerTime)
        }
      })
    }
    // 重置每个底部轨道里的弹幕数据
    resetBottomTrackers = (schedulerTime: number) => {
      this._bottomTrackList.forEach(tracker => {
        if (tracker.barrage) {
          tracker.barrage.setRunTime(schedulerTime)
        }
      })
    }
    // 遍历流动弹幕
    eachFlowBarrages = (callback: (barrage: Barrage) => void) => {
      this._flowTrackList.forEach(tracker => {
        tracker.barrageQueue.each(callback)
      })
    }
    // 遍历置顶弹幕
    eachTopBarrages = (callback: (barrage: Barrage) => void) => {
      this._topTrackList.forEach(tracker => {
        if (tracker.barrage) {
          callback(tracker.barrage)
        }
      })
    }
    // 遍历底部弹幕
    eachBottomBarrages = (callback: (barrage: Barrage) => void) => {
      this._bottomTrackList.forEach(tracker => {
        if (tracker.barrage) {
          callback(tracker.barrage)
        }
      })
    }
    // 检查是否有越界的流动弹幕，进行清理
    cleanOutOfBoundsFlowBarrages = () => {
      this._flowTrackList.forEach(tracker => {
        const selectedBarrage = tracker.barrageQueue.front()
        if (!selectedBarrage) {
          return
        }
        // 轨道头部的弹幕越界了
        if ((- selectedBarrage.position) > selectedBarrage.textWidth) {
          tracker.barrageQueue.dequeue()
        }
      })
    }
    // 检查是否有越时的置顶弹幕，进行清理
    cleanOutOfBoundsTopBarrages = () => {
      this._topTrackList.forEach(tracker => {
        const topBarrage = tracker.barrage
        if (topBarrage && (topBarrage.runTime - topBarrage.startTime) > topBarrage.duration) {
          tracker.barrage = null
        }
      })
    }
    // 检查是否有越时的置顶弹幕，进行清理
    cleanOutOfBoundsBottomBarrages = () => {
      this._bottomTrackList.forEach(tracker => {
        const bottomBarrage = tracker.barrage
        if (bottomBarrage && (bottomBarrage.runTime - bottomBarrage.startTime) > bottomBarrage.duration) {
          tracker.barrage = null
        }
      })
    }
}