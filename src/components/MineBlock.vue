<template>
  <button
    border="0.5 gray-400/10"
    w-10
    h-10
    m="0.5"
    flex="~"
    justify-center
    items-center
    hover="bg-gray/10"
    :class="getBlockClass(block)"
    @mousedown="whichButtons"
  >
    <template v-if="block.revealed">
      <div v-if="block.mine" i-mdi-mine />
      <div v-else font-600>{{ block.adjacentMines }}</div>
    </template>
  </button>
</template>

<script setup lang="ts">
import type { BlockState } from '~/types';
defineProps<{ block: BlockState }>();
const emit = defineEmits<{
  (e: 'lrclick', event: MouseEvent): void
}>()
const whichButtons = (event: MouseEvent) => {
  if (event.buttons === 3)
    emit('lrclick', event)
}
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
const getBlockClass = (block: BlockState) => {
  if (!block.revealed) return 'bg-gray-500/10 hover:bg-gray-500/20';
  return block.mine ? 'bg-red-500/10' : numberColors[block.adjacentMines];
};
</script>
