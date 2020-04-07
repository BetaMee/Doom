import Scheduler from './Scheduler'

class Doom extends Scheduler {
    animationId: number = 0
    // 底部弹幕
    triggerBottomBarrage = (barrage: { text: string, color?: string }) => {
        this.addBottomBarrage(barrage)
    }
    // 置顶弹幕
    triggerTopBarrage = (barrage: { text: string, color?: string }) => {
        this.addTopBarrage(barrage)
    }
    // 普通弹幕
    triggerFlowBarrage = (barrage: { text: string, color?: string }) => {
        this.addFlowBarrage(barrage)
    }
    // 开始
    start = () => {
        // 启动时钟
        this.startRealTime()
        // 记录下上一次的 schedulerTime
        const lastSchedulerTime = this.schedulerTime
        const animationFunc = () => {
            this.triggerBarrage(lastSchedulerTime)
            this.animationId = window.requestAnimationFrame(animationFunc)
        }
        this.animationId = window.requestAnimationFrame(animationFunc)
    }
    // 暂停
    pause = () => {
        if (this.animationId) {
            window.cancelAnimationFrame(this.animationId)
        }
    }
    // 继续
    continue = () => {
        // 跟start一样
        this.start()
    }
}

export default Doom
