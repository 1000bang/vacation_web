<template>
  <div class="vacation-calendar">
    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn">‹</button>
      <h3>{{ currentMonthYear }}</h3>
      <button @click="nextMonth" class="nav-btn">›</button>
    </div>
    
    <div class="calendar-grid">
      <div class="calendar-weekdays">
        <div 
          v-for="(day, index) in weekdays" 
          :key="day" 
          class="weekday"
          :class="{
            'sunday': index === 0,
            'saturday': index === 6
          }"
        >
          {{ day }}
        </div>
      </div>
      
      <div class="calendar-days">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            'other-month': day.otherMonth,
            'today': day.isToday,
            'has-vacation': day.vacations && day.vacations.length > 0,
            'sunday': day.fullDate.getDay() === 0,
            'saturday': day.fullDate.getDay() === 6
          }"
        >
          <div class="day-number">{{ day.date }}</div>
          <div v-if="day.vacations && day.vacations.length > 0" class="vacation-items">
            <div
              v-for="(vacation, idx) in day.vacations"
              :key="idx"
              class="vacation-item"
              :class="{ 'truncated': idx >= 2 }"
            >
              <div 
                class="vacation-content"
                :title="getVacationTooltip(vacation)"
              >
                <span class="vacation-text">{{ vacation.applicant || '휴가' }}</span>
              </div>
            </div>
            <div 
              v-if="day.vacations.length > 2" 
              class="vacation-more"
              @click.stop="showMoreVacations(day.vacations.slice(2), day.fullDate)"
            >
              +{{ day.vacations.length - 2 }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 더보기 모달 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>{{ modalDateText }}</h4>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div 
            v-for="(vacation, idx) in modalVacations" 
            :key="idx"
            class="modal-vacation-item"
            :title="getVacationTooltip(vacation)"
          >
            <span class="modal-applicant">{{ vacation.applicant || '휴가' }}</span>
            <span class="modal-type">{{ getVacationTypeLabel(vacation.type) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCalendarVacationList, type VacationHistory } from '@/api/vacation'

interface CalendarDay {
  date: number
  fullDate: Date
  otherMonth: boolean
  isToday: boolean
  vacations: VacationHistory[]
}

const currentDate = ref(new Date())
const vacations = ref<VacationHistory[]>([])
const loading = ref(false)
const showModal = ref(false)
const modalVacations = ref<VacationHistory[]>([])
const modalDate = ref<Date | null>(null)

const weekdays = ['일', '월', '화', '수', '목', '금', '토']

// 휴가 구분 한글 매핑
const vacationTypeMap: Record<string, string> = {
  'YEONCHA': '연차',
  'GYEONGJO': '경조',
  'CHULSAN': '출산',
  'GYEOLGEUN': '결근',
  'BYEONGGA': '병가',
  'GITA': '기타',
  'YEBIGUN': '예비군',
  'AM_HALF': '오전 반차',
  'PM_HALF': '오후 반차'
}

// 휴가 구분을 한글로 변환
const getVacationTypeLabel = (type: string | undefined): string => {
  if (!type) return ''
  return vacationTypeMap[type] || type
}

const currentMonthYear = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}년 ${month}월`
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const today = new Date()
  
  // 이번 달 첫 날
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay()
  
  // 이번 달 마지막 날
  const lastDay = new Date(year, month + 1, 0)
  const lastDate = lastDay.getDate()
  
  // 이전 달 마지막 날
  const prevMonthLastDate = new Date(year, month, 0).getDate()
  
  const days: CalendarDay[] = []
  
  // 이전 달 날짜들
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonthLastDate - i
    const fullDate = new Date(year, month - 1, date)
    days.push({
      date,
      fullDate,
      otherMonth: true,
      isToday: isSameDay(fullDate, today),
      vacations: getVacationsForDate(fullDate)
    })
  }
  
  // 이번 달 날짜들
  for (let date = 1; date <= lastDate; date++) {
    const fullDate = new Date(year, month, date)
    days.push({
      date,
      fullDate,
      otherMonth: false,
      isToday: isSameDay(fullDate, today),
      vacations: getVacationsForDate(fullDate)
    })
  }
  
  // 다음 달 날짜들 (캘린더를 42칸으로 채우기 위해)
  const remainingDays = 42 - days.length
  for (let date = 1; date <= remainingDays; date++) {
    const fullDate = new Date(year, month + 1, date)
    days.push({
      date,
      fullDate,
      otherMonth: true,
      isToday: isSameDay(fullDate, today),
      vacations: getVacationsForDate(fullDate)
    })
  }
  
  return days
})

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

const getVacationsForDate = (date: Date): VacationHistory[] => {
  return vacations.value.filter(vacation => {
    // 날짜만 비교하기 위해 시간 부분 제거
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const startDate = new Date(vacation.startDate)
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endDate = new Date(vacation.endDate)
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    
    // targetDate가 startDate와 endDate 사이에 있는지 확인 (양쪽 끝 포함)
    return targetDate >= startDateOnly && targetDate <= endDateOnly
  })
}

const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const loadVacations = async () => {
  loading.value = true
  try {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth() + 1
    const response = await getCalendarVacationList(year, month)
    vacations.value = response.resultMsg || []
  } catch (error) {
    console.error('캘린더 휴가 목록 조회 실패:', error)
    vacations.value = []
  } finally {
    loading.value = false
  }
}

const getVacationTooltip = (vacation: VacationHistory): string => {
  const applicant = vacation.applicant || '휴가'
  const typeLabel = getVacationTypeLabel(vacation.type)
  const startDate = vacation.startDate ? new Date(vacation.startDate).toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : ''
  const endDate = vacation.endDate ? new Date(vacation.endDate).toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : ''
  
  if (startDate && endDate) {
    return `${applicant}\n${typeLabel}\n${startDate} ~ ${endDate}`
  }
  return `${applicant} - ${typeLabel}`
}

const modalDateText = computed(() => {
  if (!modalDate.value) return ''
  const year = modalDate.value.getFullYear()
  const month = modalDate.value.getMonth() + 1
  const date = modalDate.value.getDate()
  return `${year}년 ${month}월 ${date}일`
})

const showMoreVacations = (vacations: VacationHistory[], date: Date) => {
  modalVacations.value = vacations
  modalDate.value = date
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  modalVacations.value = []
  modalDate.value = null
}

onMounted(() => {
  loadVacations()
})
</script>

<style scoped>
.vacation-calendar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #1226aa;
}

.calendar-header h3 {
  margin: 0;
  color: #1226aa;
  font-size: 1.25rem;
  font-weight: 600;
}

.nav-btn {
  background: #1226aa;
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-width: 44px;
  min-height: 44px;
}

.nav-btn:hover {
  background: #17ccff;
  transform: scale(1.1);
}

.nav-btn:active {
  transform: scale(0.95);
  background: #17ccff;
}

.calendar-grid {
  display: flex;
  flex-direction: column;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #2c3e50;
  padding: 0.5rem;
  font-size: 0.9rem;
}

.weekday.sunday {
  color: #e74c3c;
}

.weekday.saturday {
  color: #3498db;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day {
  min-height: 100px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.5rem;
  background: #f8f9fa;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.calendar-day:hover {
  background: #e9ecef;
  border-color: #1226aa;
}

.calendar-day:active {
  transform: scale(0.98);
}

.calendar-day.other-month {
  background: #f0f0f0;
  color: #999;
}

.calendar-day.today {
  background: rgba(23, 204, 255, 0.1);
  border-color: #17ccff;
  border-width: 2px;
}

.calendar-day.has-vacation {
  background: rgba(18, 38, 170, 0.05);
}

.day-number {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #2c3e50;
}

.calendar-day.sunday .day-number {
  color: #e74c3c;
}

.calendar-day.saturday .day-number {
  color: #3498db;
}

.calendar-day.sunday.other-month .day-number {
  color: #f8a5a5;
}

.calendar-day.saturday.other-month .day-number {
  color: #85c1e9;
}

.vacation-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
}

.vacation-item {
  position: relative;
  overflow: visible;
}

.vacation-item.truncated {
  display: none;
}

.vacation-content {
  background: #1226aa;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.vacation-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vacation-content:hover {
  background: #17ccff;
  transform: scale(1.05);
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.vacation-content:hover .vacation-text {
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  word-break: break-word;
}

.vacation-more {
  background: #17ccff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-align: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.vacation-more:hover {
  background: #1226aa;
  transform: scale(1.05);
  z-index: 10;
}

.vacation-more:active {
  transform: scale(0.95);
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 2px solid #1226aa;
  background: #f8f9fa;
}

.modal-header h4 {
  margin: 0;
  color: #1226aa;
  font-size: 1.1rem;
  font-weight: 600;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  line-height: 1;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.modal-close:hover {
  background: #e9ecef;
  color: #1226aa;
}

.modal-close:active {
  transform: scale(0.9);
}

.modal-body {
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
}

.modal-vacation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s;
}

.modal-vacation-item:hover {
  background: #e9ecef;
  border-color: #1226aa;
  transform: translateX(4px);
}

.modal-vacation-item:last-child {
  margin-bottom: 0;
}

.modal-applicant {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.modal-type {
  color: #1226aa;
  font-size: 0.85rem;
  padding: 0.25rem 0.75rem;
  background: rgba(18, 38, 170, 0.1);
  border-radius: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .vacation-calendar {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .calendar-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
  }

  .calendar-header h3 {
    font-size: 1.1rem;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 1.8rem;
    min-width: 44px;
    min-height: 44px;
  }

  .calendar-weekdays {
    gap: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .weekday {
    padding: 0.4rem 0.25rem;
    font-size: 0.8rem;
  }

  .calendar-days {
    gap: 0.25rem;
  }

  .calendar-day {
    min-height: 70px;
    padding: 0.4rem 0.25rem;
    border-radius: 6px;
  }

  .day-number {
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
  }

  .vacation-items {
    gap: 0.2rem;
  }

  .vacation-item {
    font-size: 0.65rem;
    padding: 0.2rem 0.35rem;
    line-height: 1.2;
  }

  .vacation-more {
    font-size: 0.65rem;
    padding: 0.2rem 0.35rem;
  }

  .modal-content {
    max-width: 90%;
    max-height: 70vh;
  }

  .modal-header {
    padding: 0.75rem 1rem;
  }

  .modal-header h4 {
    font-size: 1rem;
  }

  .modal-body {
    padding: 0.75rem;
  }

  .modal-vacation-item {
    padding: 0.6rem;
  }

  .modal-applicant {
    font-size: 0.9rem;
  }

  .modal-type {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .vacation-calendar {
    padding: 0.75rem;
    border-radius: 8px;
  }

  .calendar-header {
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
  }

  .calendar-header h3 {
    font-size: 1rem;
    padding: 0 0.5rem;
  }

  .nav-btn {
    width: 36px;
    height: 36px;
    font-size: 1.5rem;
    min-width: 44px;
    min-height: 44px;
  }

  .calendar-weekdays {
    gap: 0.2rem;
  }

  .weekday {
    padding: 0.35rem 0.2rem;
    font-size: 0.75rem;
  }

  .calendar-days {
    gap: 0.2rem;
  }

  .calendar-day {
    min-height: 60px;
    padding: 0.3rem 0.2rem;
    border-radius: 4px;
  }

  .day-number {
    font-size: 0.8rem;
    margin-bottom: 0.15rem;
  }

  .vacation-items {
    gap: 0.15rem;
  }

  .vacation-item {
    font-size: 0.6rem;
    padding: 0.15rem 0.3rem;
    border-radius: 3px;
    line-height: 1.1;
    max-width: 100%;
  }

  .vacation-item:hover {
    position: absolute;
    min-width: 100px;
    max-width: 150px;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .vacation-more {
    font-size: 0.6rem;
    padding: 0.15rem 0.3rem;
    border-radius: 3px;
  }

  .calendar-day.today {
    border-width: 1.5px;
  }

  .modal-content {
    max-width: 90%;
    max-height: 70vh;
  }

  .modal-header {
    padding: 0.6rem 0.75rem;
  }

  .modal-header h4 {
    font-size: 0.95rem;
  }

  .modal-body {
    padding: 0.6rem;
  }

  .modal-vacation-item {
    padding: 0.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }

  .modal-applicant {
    font-size: 0.85rem;
  }

  .modal-type {
    font-size: 0.75rem;
    align-self: flex-end;
  }
}
</style>
