<template>
  <div class="signature-generator">
    <div class="form-group">
      <label>폰트 선택 <span class="required">*</span></label>
      <select 
        v-model="selectedFont" 
        @change="onFontChange"
        :disabled="isGenerating || isSaving"
        class="font-select"
      >
        <option value="">폰트를 선택하세요</option>
        <option 
          v-for="font in availableFonts" 
          :key="font.file" 
          :value="font.file"
        >
          {{ font.name }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>사용자 이름 <span class="required">*</span></label>
      <input 
        type="text" 
        v-model="userName" 
        :placeholder="defaultUserName || '이름을 입력하세요'"
        :disabled="isGenerating || isSaving"
        class="user-name-input"
      />
      <small class="hint-text">서명에 표시될 이름입니다</small>
    </div>

    <!-- 미리보기 영역 -->
    <div class="form-group">
      <label>서명 미리보기</label>
      <div class="preview-container">
        <div v-if="isGenerating" class="preview-loading">
          <p>미리보기 생성 중...</p>
        </div>
        <div v-else-if="previewImageUrl" class="preview-image-wrapper">
          <img 
            :src="previewImageUrl" 
            alt="서명 미리보기" 
            class="preview-image"
            @error="handleImageError"
          />
        </div>
        <div v-else class="preview-placeholder">
          <p>폰트와 이름을 입력하면 자동으로 미리보기가 표시됩니다</p>
        </div>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="action-buttons">
      <button 
        @click="saveSignature" 
        :disabled="!canSave || isSaving || isGenerating"
        class="btn btn-save"
      >
        {{ isSaving ? '저장 중...' : '서명 저장' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getAvailableFonts, uploadSignature } from '../api/user'
import apiClient from '../api/axios'
import type { FontInfo } from '../api/user'

// Props
interface Props {
  defaultUserName?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultUserName: ''
})

// Emits
const emit = defineEmits<{
  saved: []
  cancelled: []
}>()

// State
const availableFonts = ref<FontInfo[]>([])
const selectedFont = ref<string>('')
const userName = ref<string>(props.defaultUserName || '')
const previewImageUrl = ref<string>('')
const isGenerating = ref(false)
const isSaving = ref(false)

// Computed
const canGeneratePreview = computed(() => {
  return selectedFont.value && userName.value.trim()
})

const canSave = computed(() => {
  return selectedFont.value && userName.value.trim()
})

// Methods
const loadFonts = async () => {
  try {
    const response = await getAvailableFonts()
    if (response.resultCode === '0' && response.resultMsg?.fonts) {
      availableFonts.value = response.resultMsg.fonts
    }
  } catch (error) {
    console.error('폰트 목록 조회 실패:', error)
    alert('폰트 목록을 불러오는데 실패했습니다.')
  }
}

const onFontChange = () => {
  // 폰트 변경 시 미리보기 자동 업데이트
  updatePreview()
}

// 미리보기 업데이트 (자동)
const updatePreview = async () => {
  if (!canGeneratePreview.value) {
    previewImageUrl.value = ''
    return
  }

  isGenerating.value = true
  try {
    // 백엔드 미리보기 API 호출 (저장하지 않음)
    // axios를 사용하여 인증 헤더 포함하여 이미지 받기
    const response = await apiClient.get('/user/signature/preview', {
      params: {
        fontType: selectedFont.value,
        userName: userName.value.trim()
      },
      responseType: 'blob'
    })
    
    // Blob을 data URL로 변환
    const blob = response.data
    const reader = new FileReader()
    reader.onloadend = () => {
      previewImageUrl.value = reader.result as string
    }
    reader.readAsDataURL(blob)
  } catch (error: any) {
    console.error('서명 미리보기 생성 실패:', error)
    previewImageUrl.value = ''
    
    // 404 또는 400 에러인 경우 alert 표시
    if (error.response?.status === 404 || error.response?.status === 400) {
      // 에러 메시지가 Blob으로 반환된 경우 텍스트로 변환
      if (error.response?.data instanceof Blob) {
        error.response.data.text().then((errorText: string) => {
          if (errorText.includes('찾을 수 없습니다') || errorText.includes('사용할 수 없는')) {
            alert('해당 폰트를 찾을 수 없습니다.')
          } else {
            alert('해당 폰트를 찾을 수 없습니다.')
          }
        }).catch(() => {
          alert('해당 폰트를 찾을 수 없습니다.')
        })
      } else {
        alert('해당 폰트를 찾을 수 없습니다.')
      }
    }
  } finally {
    isGenerating.value = false
  }
}

// 사용자 이름 변경 시 미리보기 자동 업데이트
let previewTimeout: ReturnType<typeof setTimeout> | null = null
watch([selectedFont, userName], () => {
  // 이전 타임아웃 취소
  if (previewTimeout) {
    clearTimeout(previewTimeout)
  }
  
  if (selectedFont.value && userName.value.trim()) {
    // 디바운싱: 입력이 끝난 후 미리보기 업데이트
    previewTimeout = setTimeout(() => {
      updatePreview()
    }, 300)
  } else {
    previewImageUrl.value = ''
  }
})

const saveSignature = async () => {
  if (!canGeneratePreview.value) {
    alert('폰트와 이름을 모두 입력해주세요.')
    return
  }

  isSaving.value = true
  try {
    // 서명 저장 API 호출
    const response = await uploadSignature(undefined, selectedFont.value, userName.value.trim())
    
    if (response.resultCode === '0') {
      alert('서명이 저장되었습니다.')
      emit('saved')
    } else {
      alert('서명 저장에 실패했습니다.')
    }
  } catch (error: any) {
    console.error('서명 저장 실패:', error)
    alert(error.response?.data?.resultMsg?.errorMessage || '서명 저장에 실패했습니다.')
  } finally {
    isSaving.value = false
  }
}

// 이미지 로드 실패 처리
const handleImageError = () => {
  console.error('서명 미리보기 이미지 로드 실패')
  previewImageUrl.value = ''
}

// Lifecycle
onMounted(() => {
  loadFonts()
  if (props.defaultUserName) {
    userName.value = props.defaultUserName
  }
})
</script>

<style scoped>
.signature-generator {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #e74c3c;
}

.font-select,
.user-name-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.font-select:disabled,
.user-name-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.hint-text {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.875rem;
}

.preview-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  min-height: 150px;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image-wrapper {
  width: 100%;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  background: transparent;
}

.preview-placeholder,
.preview-loading {
  text-align: center;
  color: #999;
}

.preview-placeholder p,
.preview-loading p {
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-preview {
  background-color: #3498db;
  color: white;
}

.btn-preview:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-save {
  background-color: #27ae60;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #229954;
}
</style>
