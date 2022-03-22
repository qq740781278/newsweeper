<script setup lang="ts">
import type { BlockState } from '~/types'
const WIDTH = 10;
const HEIGHT = 10;
const data = reactive(
  Array.from({ length: HEIGHT }, (_, y) => {
    return Array.from({ length: WIDTH }, (_, x): BlockState => {
      return { x, y, adjacentMines: 0, revealed: false };
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
const updateNumbers = () => {
  data.forEach((row) => {
    row.forEach((block) => {
      const { mine, x, y } = block;
      if (mine) return;
      directions.forEach(([dx, dy]) => {
        const x2 = dx + x;
        const y2 = dy + y;
        if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) return;
        data[y2][x2].mine && block.adjacentMines++;
      });
    });
  });
};
const generateMines = () => {
  for (const row of data) {
    for (const block of row) block.mine = Math.random() < 0.1;
  }
};

// const onClick = (block: BlockState) => {
//   if (block.mine) {
//     block.revealed = true;
//     return setTimeout(() => {
//       alert('lost');
//     }, 10);
//   }
//   openEmptyBlock(block);
// };
const openEmptyBlock = (block: BlockState) => {
  const { x, y, adjacentMines } = block;
  if (adjacentMines) return
  directions.forEach(([dx, dy]) => {
    const x2 = dx + x;
    const y2 = dy + y;
    if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) return 
    const aroundBlock = data[y2][x2];
    if (!aroundBlock.mine && !aroundBlock.adjacentMines) {
       aroundBlock.revealed = true;
       openEmptyBlock(aroundBlock)
    }
  });
};
generateMines();
updateNumbers();
</script>

<template>
  <div>
    MineSweeper
    <div v-for="row , y in data" :key="y" flex="~" justify-center items-center>
      <MineBlock
        v-for=" block in row"
        :key="block.x"
      >
      </MineBlock>
    </div>
  </div>
</template>
