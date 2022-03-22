<script setup lang="ts">
interface BlockState {
  x: number;
  y: number;
  revealed: boolean;
  mine?: boolean;
  flagged?: boolean;
  adjacentMines: number;
}
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
const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-orange-500',
  'text-red-500',
  'text-purple-500',
  'text-pink-500',
  'text-teal-500'
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
    for (const block of row) block.mine = Math.random() < 0.3;
  }
};
const getBlockClass = (block: BlockState) => {
  if(!block.revealed) return 'bg-gray-500/10 hover:bg-gray-500/20'
  return block.mine ? 'bg-red-500/10' : numberColors[block.adjacentMines];
};
const onClick = (block: BlockState) => {
  block.revealed = true
};
generateMines();
updateNumbers();
</script>

<template>
  <div>
    MineSweeper
    <div v-for="row , y in data" :key="y" flex="~" justify-center items-center>
      <button
        v-for=" block in row"
        :key="block.x"
        border="0.5 gray-400/10"
        w-10
        h-10
        m="0.5"
        flex="~"
        justify-center
        items-center
        hover="bg-gray/10"
        :class="getBlockClass(block)"
        @click="onClick(block)"
      >
        <template v-if="block.revealed">
          <div v-if="block.mine" i-mdi-mine />
          <div v-else font-600>{{ block.adjacentMines }}</div>
        </template>
      </button>
    </div>
  </div>
</template>
