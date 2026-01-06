<template>
  <div v-if="isOpen" class="help-modal-overlay" @click="closeModal">
    <div class="help-modal-container" @click.stop>
      <div class="help-modal-header">
        <h3>도움말</h3>
        <button class="close-button" @click="closeModal" aria-label="닫기">
          ×
        </button>
      </div>
      <div class="help-modal-content">
        <img :src="imageSrc" :alt="altText" class="help-image" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  imageSrc: string
  altText?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
.help-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.help-modal-container {
  background: white;
  border-radius: 12px;
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.help-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.help-modal-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #f0f0f0;
  color: #333;
}

.help-modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.help-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .help-modal-overlay {
    padding: 0.5rem;
  }

  .help-modal-container {
    max-width: 95vw;
    max-height: 95vh;
    border-radius: 8px;
  }

  .help-modal-header {
    padding: 0.75rem 1rem;
  }

  .help-modal-header h3 {
    font-size: 1.1rem;
  }

  .close-button {
    font-size: 1.75rem;
    width: 28px;
    height: 28px;
  }

  .help-modal-content {
    padding: 1rem;
  }
}
</style>

