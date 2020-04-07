/**
 * Barrage 构造函数注解
 */
interface IBarrageConstructor {
  text: string
  textColor: string | undefined
  textWidth: number
  cvsWidth: number
  position: number
  duration: number
}

/**
 * 弹幕
 */
export default class Barrage {
    text: string
    color: string
    textWidth: number
    speed: number
    startTime: number
    runTime: number
    duration: number
    trackerNo: number
    position: number
    cvsWidth: number
    constructor(params: IBarrageConstructor) {
      this.text = params.text // 文本
      this.color = params.textColor || '#FFFFFF'// 文本颜色
      this.textWidth = params.textWidth // 文本宽度
      this.speed = (params.cvsWidth + params.textWidth) / params.duration // 流动文本运行的速度
      this.startTime = 0 // 文本置入轨道时的时间（考虑到大量弹幕阻塞）
      this.runTime = 0 // 文本运行时间，置顶&底部文本会延时消失
      this.duration = params.duration // 弹幕展示时间
      this.trackerNo = 0 // 文本所在的轨道
      this.position = params.position // 初始所在轨道的位置，初始值为屏幕的宽度
      this.cvsWidth = params.cvsWidth // 轨道宽度
    }
    setPosition = (schedulerTime: number) => {
      this.position = this.cvsWidth - this.speed * (schedulerTime - this.startTime)
    }
    setStartTime = (schedulerTime: number) => {
      this.startTime = schedulerTime
    }
    setRunTime = (schedulerTime: number) => {
      this.runTime = schedulerTime
    }
    setTrackerNo = (trackerNo: number) => {
      this.trackerNo = trackerNo
    }
  }