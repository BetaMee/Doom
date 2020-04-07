import Tracker from './Tracker'
import Barrage from './Barrage'

/**
 * 调度器
 */
export default class Scheduler {
    ctx: CanvasRenderingContext2D
    cvsHeight: number
    cvsWidth: number
    duration: number
    _trackHeight: number
    tracker: Tracker
    schedulerTime: number
    _realTime: number
    clock: number
    constructor({
      cvsId = '',
      clock = 0,
      fontSize = 32,
      fontFamily = 'serif',
      duration = 4000
    }) {
      const cvs = document.getElementById(cvsId) as HTMLCanvasElement
      const ctx = cvs.getContext('2d')
      // 没有获取到 canvas id
      if (!ctx) {
        throw new Error('error get canvas id!')
      }
      // 获取 canvas 句柄
      this.ctx = ctx
      // 弹幕屏幕的高度
      this.cvsHeight = ctx.canvas.height
      // 弹幕屏幕的宽度
      this.cvsWidth = ctx.canvas.width
      // 弹幕展示时间（ms）
      this.duration = duration
      // 字体的大小
      ctx.font = `${fontSize}px ${fontFamily}`
      // 划分轨道
      this._trackHeight = fontSize // 单个轨道宽度度=字体高度
      this.tracker = new Tracker({
        trackCount: Math.floor(this.cvsHeight / fontSize), // 轨道数量
        trackLength: ctx.canvas.width // 轨道长度
      })
      // 调度器时间，用于描述当前视频或者弹幕进行到哪一毫秒
      this.schedulerTime = 0
      // 真实时间
      this._realTime = 0
      // 总的视频时间
      this.clock = clock
    }
    // 新增一条流动弹幕
    addFlowBarrage = ({ text, color }: { text: string, color?: string }) => {
      const textWidth = this.ctx.measureText(text).width
      const params = {
        text, // 文本
        textColor: color, // 颜色
        textWidth, // 文本宽度
        cvsWidth: this.cvsWidth, // 轨道宽度
        position: this.cvsWidth, // 初始位置
        duration: this.duration // 一条弹幕展示时间
      }
      const barrage = new Barrage(params)
      this.tracker.addToFlowBarrageQueue(barrage)
    }
    // 新增一条置顶弹幕
    addTopBarrage = ({ text, color } : { text: string, color?: string }) => {
      const textWidth = this.ctx.measureText(text).width
      const params = {
        text, // 文本
        textColor: color, // 颜色
        textWidth, // 文本宽度
        cvsWidth: this.cvsWidth, // 轨道宽度
        position: (this.cvsWidth - textWidth) / 2,// 初始位置，居中
        duration: this.duration // 一条弹幕展示时间
      }
      const barrage = new Barrage(params)
      this.tracker.addToTopBarrageQueue(barrage)
    }
    // 新增一条置顶弹幕
    addBottomBarrage = ({ text, color } : { text: string, color?: string }) => {
      const textWidth = this.ctx.measureText(text).width
      const params = {
        text, // 文本
        textWidth, // 文本宽度
        textColor: color, // 颜色
        cvsWidth: this.cvsWidth, // 轨道宽度
        position: (this.cvsWidth - textWidth) / 2,// 初始位置，居中
        duration: this.duration // 一条弹幕展示时间
      }
      const barrage = new Barrage(params)
      this.tracker.addToBottomBarrageQueue(barrage)
    }
    // 发射弹幕，这个方法是不停循环触发的，它会读取当前的弹幕列表
    triggerBarrage = (lastSchedulerTime: number) => {
      // 获取差值
      const newRealTime = +new Date()
      const diffRealTime = newRealTime - this._realTime
      // 设置新的调度时间
      this.schedulerTime = lastSchedulerTime + diffRealTime
      // 将流动弹幕&置顶弹幕&底部弹幕置入轨道中
      this.tracker.reorderFlowTrackers(this.schedulerTime)
      this.tracker.reorderTopTrackers(this.schedulerTime)
      this.tracker.reorderBottomTrackers(this.schedulerTime)
      // 将流动弹幕&置顶弹幕&底部弹幕进行重置，改变其位置或者时间
      this.tracker.resetFlowTrackers(this.schedulerTime)
      this.tracker.resetTopTrackers(this.schedulerTime)
      this.tracker.resetBottomTrackers(this.schedulerTime)
      // 清理页面
      this.clearBarrageScreen()
      // 开始绘制
      this.tracker.eachFlowBarrages(this.drawBarrage)
      this.tracker.eachTopBarrages(this.drawBarrage)
      this.tracker.eachBottomBarrages(this.drawBarrage)
      // 检查并清理越界或者越时弹幕
      this.tracker.cleanOutOfBoundsFlowBarrages()
      this.tracker.cleanOutOfBoundsTopBarrages()
      this.tracker.cleanOutOfBoundsBottomBarrages()
    }
    // 将弹幕绘制到页面上
    drawBarrage = (barrage: Barrage) => {
      this.ctx.fillStyle = barrage.color
      this.ctx.fillText(
        barrage.text,
        barrage.position,
        (barrage.trackerNo + 1) * this._trackHeight
      );
    }
    // 清理屏幕
    clearBarrageScreen = () => {
      this.ctx.clearRect(0, 0, this.cvsWidth, this.cvsHeight)
    }
    // 启动时钟
    startRealTime = () => {
      // 启动弹幕时的时间戳
      this._realTime = +new Date()
    }
  }