import { describe, expect, it } from 'vitest'
import { computeDraggedSizes, LEAF_MIN_SIZE } from './ContentSplit'

describe('computeDraggedSizes', () => {
  it('按 sum(sizes)/totalPx 系数把像素位移换算为权重增减', () => {
    // totalPx=1000, sizes=[1,1] → 1 单位权重 = 500px；拖 100px → 权重增减 0.2
    expect(computeDraggedSizes([1, 1], 0, 100, 1000)).toEqual([1.2, 0.8])
    // 非默认权重同样成立：sizes=[1,3] → 1 单位权重 = 250px；拖 50px → 增减 0.2
    expect(computeDraggedSizes([1, 3], 0, 50, 1000)).toEqual([1.2, 2.8])
  })

  it('只调整 divider 相邻两个 child，其余不变，总权重守恒', () => {
    const result = computeDraggedSizes([1, 1, 2], 1, 100, 1000)
    expect(result[0]).toBe(1)
    expect(result[1] + result[2]).toBeCloseTo(3)
  })

  it('左侧触 min 时按 LEAF_MIN_SIZE 像素精确钳制，亏量转移到右侧', () => {
    // totalPx=1000, sizes=[1,1]，左拖 -500px → 左侧应恰好停在 120px 对应的权重 0.24
    const result = computeDraggedSizes([1, 1], 0, -500, 1000)
    const minWeight = (LEAF_MIN_SIZE * 2) / 1000
    expect(result[0]).toBeCloseTo(minWeight)
    expect(result[0] + result[1]).toBeCloseTo(2)
  })

  it('右侧触 min 时同理对称钳制', () => {
    const result = computeDraggedSizes([1, 1], 0, 500, 1000)
    const minWeight = (LEAF_MIN_SIZE * 2) / 1000
    expect(result[1]).toBeCloseTo(minWeight)
    expect(result[0] + result[1]).toBeCloseTo(2)
  })
})
