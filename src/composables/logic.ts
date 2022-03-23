import type { Ref } from 'vue'
import type { BlockState } from '~/types'

const directions = [
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, 1],
  [0, -1],
]
type GameStatus = 'ready' | 'play' | 'won' | 'lost'

interface GameState {
  board: BlockState[][]
  mineGenerated: boolean
  status: GameStatus
  startMS?: number
  endMS?: number
}

export class GamePlay {
  state = ref() as Ref<GameState>
  constructor(public width: number, public height: number, public mines: number) {
    this.reset()
  }

  get board() {
    return this.state.value.board
  }

  get blocks() {
    return this.state.value.board.flat()
  }

  get mineGenerated() {
    return this.state.value.mineGenerated
  }

  set mineGenerated(boolean: boolean) {
    this.state.value.mineGenerated = boolean
  }

  reset(width = this.width, height = this.height, mines = this.mines) {
    this.width = width
    this.height = height
    this.mines = mines

    this.state.value = {
      mineGenerated: false,
      status: 'ready',
      board: Array.from({ length: height }, (_, y) => {
        return Array.from({ length: width }, (_, x): BlockState => {
          return { x, y, adjacentMines: 0, revealed: false, mine: false }
        })
      }),
    }
  }

  randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.randomRange(min, max))
  }

  generateMines(state: BlockState[][], initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = state[y][x]
      if (Math.abs(initial.x - block.x) <= 1 && Math.abs(initial.y - block.y) <= 1)
        return false
      if (block.mine)
        return false
      block.mine = true
      return true
    }
    Array.from({ length: this.mines }, () => null)
      .forEach(() => {
        let placed = false
        while (!placed)
          placed = placeRandom()
      })
    this.updateNumbers()
  }

  updateNumbers() {
    this.board.forEach((row) => {
      row.forEach((block) => {
        if (block.mine) return
        this.getSiblings(block).forEach((b) => {
          b.mine && block.adjacentMines++
        })
      })
    })
  }

  expendZero(block: BlockState) {
    if (block.adjacentMines) return
    this.getSiblings(block).forEach((b) => {
      if (b.revealed) return
      b.revealed = true
      this.expendZero(b)
    })
  }

  onRightClick(block: BlockState) {
    if (this.state.value.status !== 'play')
      return

    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  onClick(block: BlockState) {
    if (this.state.value.status === 'ready') {
      this.state.value.status = 'play'
      this.state.value.startMS = +new Date()
    }
    if (this.state.value.status !== 'play' || block.flagged)
      return

    if (!this.mineGenerated) {
      this.generateMines(this.board, block)
      this.mineGenerated = true
    }

    block.revealed = true
    if (block.mine) {
      this.onGameOver('lost')
      return
    }

    this.expendZero(block)
  }

  getSiblings(block: BlockState) {
    const { x, y } = block
    return directions.map(([dx, dy]) => {
      const x2 = dx + x
      const y2 = dy + y
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height) return undefined
      return this.board[y2][x2]
    }).filter(Boolean) as BlockState[]
  }

  showAllMines() {
    this.board.flat().forEach((i) => {
      if (i.mine)
        i.revealed = true
    })
  }

  checkGameState() {
    if (!this.mineGenerated || this.state.value.status !== 'play')
      return
    const blocks = this.board.flat()

    if (!blocks.some(block => !block.mine && !block.revealed))
      this.onGameOver('won')
  }

  autoExpand(block: BlockState) {
    if (this.state.value.status !== 'play' || block.flagged)
      return

    const siblings = this.getSiblings(block)
    const flags = siblings.reduce((a, b) => a + (b.flagged ? 1 : 0), 0)
    const notRevealed = siblings.reduce((a, b) => a + (!b.revealed && !b.flagged ? 1 : 0), 0)
    if (flags === block.adjacentMines) {
      siblings.forEach((i) => {
        if (i.revealed || i.flagged)
          return
        i.revealed = true
        this.expendZero(i)
        if (i.mine)
          this.onGameOver('lost')
      })
    }
    const missingFlags = block.adjacentMines - flags
    if (notRevealed === missingFlags) {
      siblings.forEach((i) => {
        if (!i.revealed && !i.flagged)
          i.flagged = true
      })
    }
  }

  onGameOver(status: GameStatus) {
    this.state.value.status = status
    this.state.value.endMS = +Date.now()
    if (status === 'lost') {
      this.showAllMines()
      setTimeout(() => {
        alert('lost')
      }, 10)
    }
  }
}
