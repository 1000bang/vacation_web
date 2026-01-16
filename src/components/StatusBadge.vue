<template>
  <span :class="statusClass">
    {{ statusName }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getApprovalStatusName, getApprovalStatusClass } from '@/utils/statusUtils'

interface Props {
  status?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  status: null
})

const statusName = computed(() => getApprovalStatusName(props.status))
const statusClass = computed(() => getApprovalStatusClass(props.status))
</script>

<style scoped>
.status-default {
  color: #666;
}

.status-rejected {
  color: #e74c3c;
  font-weight: 600;
}

.status-final-approved {
  color: #27ae60;
  font-weight: 600;
}
</style>
