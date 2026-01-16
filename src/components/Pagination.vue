<template>
  <div v-if="showPagination" class="pagination">
    <button 
      @click="$emit('prev')"
      :disabled="currentPage === 1"
      class="pagination-btn"
    >
      이전
    </button>
    <span class="pagination-info">
      {{ currentPage }} / {{ totalPages }}
    </span>
    <button 
      @click="$emit('next')"
      :disabled="currentPage === totalPages"
      class="pagination-btn"
    >
      다음
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPagination: true
})

defineEmits<{
  prev: []
  next: []
}>()
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #999;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-weight: 500;
  color: #666;
}
</style>
