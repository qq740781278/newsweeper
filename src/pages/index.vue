<script setup lang="ts">
import type { BlockState } from '~/types'
const WIDTH = 10;
const HEIGHT = 10;
const data = reactive(
  Array.from({ length: HEIGHT }, (_, y) => {
    return Array.from({ length: WIDTH }, (_, x): BlockState => {
      return { x, y, adjacentMines: 0, revealed: false, mine: false };
    });
  })
);
const directions = [
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, 1],
  [0, -1]
];

const getSiblings = (block: BlockState) => {
  const { x, y } = block
  return directions.map(([dx, dy]) => {
    const x2 = dx + x;
    const y2 = dy + y;
    if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) return undefined;
    return data[y2][x2]
  }).filter(Boolean) as BlockState[];
}
const expendZero = (block: BlockState) => {
  if (block.adjacentMines) return
  getSiblings(block).forEach(b => {
    if (b.revealed) return
    b.revealed = true
    expendZero(b)
  });
}
const updateNumbers = () => {
  data.forEach((row) => {
    row.forEach((block) => {
      if (block.mine) return;
      getSiblings(block).forEach((b) => {
        b.mine && block.adjacentMines++
      })
    });
  });
};

const generateMines = (initial: BlockState) => {
  for (const row of data) {
    for (const block of row) {
      if (Math.abs(initial.x - block.x) < 2)
        continue
      if (Math.abs(initial.y - block.y) < 2)
        continue
      block.mine = Math.random() < 0.3
    }
  }
};

let mineGenerated = false
let isDev = true

const onClick = (block: BlockState) => {
  block.revealed = true
  if (!mineGenerated) {
    generateMines(block)
    updateNumbers()
    mineGenerated = true
  }
  expendZero(block)
};
const rClick = (block: BlockState) => {
  if(block.revealed) return
  block.flagged = !block.flagged
};
</script>

<template>
  <div>
    MineSweeper
    <div v-for="row, y in data" :key="y" flex="~" justify-center items-center>
      <MineBlock
        v-for=" block in row"
        :key="block.x"
        :block="block"
        :is-dev="isDev"
        @lrclick="onClick"
        @rclick="rClick"
      ></MineBlock>
    </div>
  </div>
</template>
