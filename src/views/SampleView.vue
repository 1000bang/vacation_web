<template>
  <div class="sample-view">
    <div class="header-section">
      <img :src="logoVerticalImage" alt="Knowledge Point Logo" class="header-logo" />
    </div>

    <!-- 문서 타입 선택 라디오 버튼 -->
    <div class="document-type-selection">
      <h2>문서 타입 선택</h2>
      <div class="radio-group">
        <label v-for="docType in documentTypes" :key="docType.value" class="radio-label">
          <input
            type="radio"
            :value="docType.value"
            v-model="selectedDocumentType"
            :disabled="docType.disabled"
            class="radio-input"
          />
          <span :class="{ disabled: docType.disabled }">{{ docType.label }}</span>
        </label>
      </div>
    </div>

    <!-- 휴가 결무 신청서 폼 -->
    <div v-if="selectedDocumentType === 'vacation'" class="form-container">
      <h2>휴가 결무 신청서</h2>
      <!-- <form @submit.prevent="submitVacationForm" class="form"> -->
      <form class="form">
        <div class="form-group">
          <label>신청일자 <span class="required">*</span></label>
          <input type="date" v-model="vacationForm.requestDate" required />
        </div>

        <div class="form-group">
          <label>소속 <span class="required">*</span></label>
          <div class="department-select-group">
            <select
              v-model="vacationForm.departmentDivision"
              @change="vacationForm.departmentTeam = ''"
              required
              class="department-select"
            >
              <option value="">본부/센터 선택</option>
              <option value="ITO센터">ITO센터</option>
              <option value="신사업추진실">신사업추진실</option>
              <option value="솔루션사업본부">솔루션사업본부</option>
              <option value="플랫폼사업본부">플랫폼사업본부</option>
              <option value="서비스사업본부">서비스사업본부</option>
              <option value="시스템사업본부">시스템사업본부</option>
            </select>
            <select
              v-model="vacationForm.departmentTeam"
              :disabled="!vacationForm.departmentDivision"
              required
              class="department-select"
            >
              <option value="">팀 선택</option>
              <option
                v-for="team in getTeamsForDivision(vacationForm.departmentDivision)"
                :key="team"
                :value="team"
              >
                {{ team }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>신청자 <span class="required">*</span></label>
          <input type="text" v-model="vacationForm.applicant" required />
        </div>

        <div class="form-group">
          <label>시작일 <span class="required">*</span></label>
          <input type="date" v-model="vacationForm.startDate" required />
        </div>

        <div class="form-group">
          <label>종료일 <span class="required">*</span></label>
          <input type="date" v-model="vacationForm.endDate" required />
        </div>

        <div class="form-group">
          <label>휴가 구분 <span class="required">*</span></label>
          <select v-model="vacationForm.vacationType" required>
            <option value="">선택하세요</option>
            <option value="YEONCHA">연차</option>
            <option value="GYEONGJO">경조</option>
            <option value="CHULSAN">출산</option>
            <option value="GYEOLGEUN">결근</option>
            <option value="BYEONGGA">병가</option>
            <option value="GITA">기타</option>
            <option value="YEBIGUN">예비군</option>
          </select>
        </div>

        <div class="form-group">
          <label>사유</label>
          <textarea v-model="vacationForm.reason" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>총연차일수 <span class="required">*</span></label>
          <input type="number" v-model.number="vacationForm.totalVacationDays" step="0.5" required />
        </div>

        <div class="form-group">
          <label>잔여연차일수 <span class="required">*</span></label>
          <input type="number" v-model.number="vacationForm.remainingVacationDays" step="0.5" required />
        </div>

        <div class="form-group">
          <label>신청연차일수 <span class="required">*</span></label>
          <!-- 시작일과 종료일이 같을 때: 1 또는 0.5 선택 -->
          <select
            v-if="isSameDay"
            v-model.number="vacationForm.requestedVacationDays"
            required
          >
            <option value="">선택하세요</option>
            <option :value="1">1일</option>
            <option :value="0.5">0.5일</option>
          </select>
          <!-- 시작일과 종료일이 다를 때: 자동 계산 -->
          <input
            v-else
            type="number"
            :value="calculatedVacationDays"
            readonly
            class="readonly-input"
            required
          />
        </div>

        <div class="form-actions">
          <!-- <button type="submit" class="btn btn-primary">PDF 생성</button> -->
          <button type="button" @click="submitVacationFormDocx" class="btn btn-primary">DOCX 생성</button>
        </div>
      </form>
    </div>

    <!-- 월세 지원 청구서 폼 -->
    <div v-if="selectedDocumentType === 'rental'" class="form-container">
      <h2>월세 지원 청구서</h2>
      <!-- <form @submit.prevent="submitRentalForm" class="form"> -->
      <form class="form">
        <div class="form-group">
          <label>신청일자 <span class="required">*</span></label>
          <input type="date" v-model="rentalForm.requestDate" required />
        </div>

        <div class="form-group">
          <label>청구 월 <span class="required">*</span></label>
          <select v-model.number="rentalForm.month" required class="form-select">
            <option :value="null">월 선택</option>
            <option v-for="month in 12" :key="month" :value="month">
              {{ month }}월
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>소속 <span class="required">*</span></label>
          <div class="department-select-group">
            <select
              v-model="rentalForm.departmentDivision"
              @change="rentalForm.departmentTeam = ''"
              required
              class="department-select"
            >
              <option value="">본부/센터 선택</option>
              <option value="ITO센터">ITO센터</option>
              <option value="신사업추진실">신사업추진실</option>
              <option value="솔루션사업본부">솔루션사업본부</option>
              <option value="플랫폼사업본부">플랫폼사업본부</option>
              <option value="서비스사업본부">서비스사업본부</option>
              <option value="시스템사업본부">시스템사업본부</option>
            </select>
            <select
              v-model="rentalForm.departmentTeam"
              :disabled="!rentalForm.departmentDivision"
              required
              class="department-select"
            >
              <option value="">팀 선택</option>
              <option
                v-for="team in getTeamsForDivision(rentalForm.departmentDivision)"
                :key="team"
                :value="team"
              >
                {{ team }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>신청자 <span class="required">*</span></label>
          <input type="text" v-model="rentalForm.applicant" required />
        </div>

        <div class="form-group">
          <label class="label-with-help">
            월세 총 계약 시작일 <span class="required">*</span>
            <button
              type="button"
              class="help-button"
              @click="showHelpModal('rental_cont_period')"
              aria-label="도움말"
            >
              ?
            </button>
          </label>
          <input type="date" v-model="rentalForm.contractStartDate" required />
        </div>

        <div v-if="rentalForm.contractStartDate" class="form-group">
          <label>계약 단위 <span class="required">*</span></label>
          <select v-model="rentalForm.contractTermUnit" required class="form-select">
            <option value="">선택</option>
            <option value="1년">1년</option>
            <option value="2년">2년</option>
            <option value="직접입력">직접입력</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label-with-help">
            월세 총 계약 종료일 <span class="required">*</span>
            <button
              type="button"
              class="help-button"
              @click="showHelpModal('rental_cont_period')"
              aria-label="도움말"
            >
              ?
            </button>
          </label>
          <input
            type="date"
            v-model="rentalForm.contractEndDate"
            :disabled="rentalForm.contractTermUnit !== '직접입력' && rentalForm.contractTermUnit !== ''"
            required
          />
        </div>

        <div class="form-group">
          <label class="label-with-help">
            계약 월세 금액(원) <span class="required">*</span>
            <button
              type="button"
              class="help-button"
              @click="showHelpModal('rental_contract_price')"
              aria-label="도움말"
            >
              ?
            </button>
          </label>
          <div class="input-with-unit">
            <input
              type="text"
              v-model="rentalForm.contractMonthlyRent"
              @input="handleNumberInput($event, 'contractMonthlyRent')"
              @keypress="handleKeyPress"
              required
            />
            <div v-if="rentalForm.contractMonthlyRent >= 10000" class="unit-text-below">
              {{ formatKoreanWon(rentalForm.contractMonthlyRent) }}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>선불/후불 구분 <span class="required">*</span></label>
          <select v-model="rentalForm.paymentType" required>
            <option value="">선택하세요</option>
            <option value="PREPAID">선불</option>
            <option value="POSTPAID">후불</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label-with-help">
            월세 청구 개시일 <span class="required">*</span>
            <button
              type="button"
              class="help-button"
              @click="showHelpModal('rental_billing_startdate')"
              aria-label="도움말"
            >
              ?
            </button>
          </label>
          <input type="date" v-model="rentalForm.billingStartDate" required />
        </div>

        <div class="form-group">
          <label class="label-with-help">
            청구 월세 시작일 <span class="required">*</span>
            <button
              type="button"
              class="help-button"
              @click="showHelpModal('rental_billing_period')"
              aria-label="도움말"
            >
              ?
            </button>
          </label>
          <input type="date" v-model="rentalForm.billingPeriodStartDate" required />
        </div>

        <div class="form-group">
          <label class="label-with-help">
            청구 월세 종료일 <span class="required">*</span>
            <button
              type="button"
              class="help-button"
              @click="showHelpModal('rental_billing_period')"
              aria-label="도움말"
            >
              ?
            </button>
          </label>
          <input type="date" v-model="rentalForm.billingPeriodEndDate" required />
        </div>

        <div class="form-group">
          <label class="label-with-help">
            월세 납입일 <span class="required">*</span>
            <button
              type="button"
              class="help-button"
              @click="showHelpModal('rental_payment_date')"
              aria-label="도움말"
            >
              ?
            </button>
          </label>
          <input type="date" v-model="rentalForm.paymentDate" required />
        </div>

        <div class="form-group">
          <label>월세 납입 금액(원) <span class="required">*</span></label>
          <div class="input-with-unit">
            <input
              type="text"
              v-model="rentalForm.paymentAmount"
              @input="handleNumberInput($event, 'paymentAmount')"
              @keypress="handleKeyPress"
              required
            />
            <div v-if="rentalForm.paymentAmount >= 10000" class="unit-text-below">
              {{ formatKoreanWon(rentalForm.paymentAmount) }}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>월세 청구 금액(원) <span class="required">*</span></label>
          <div class="input-with-unit">
            <input
              type="text"
              v-model="rentalForm.billingAmount"
              @input="handleNumberInput($event, 'billingAmount')"
              @keypress="handleKeyPress"
              required
            />
            <div v-if="rentalForm.billingAmount >= 10000" class="unit-text-below">
              {{ formatKoreanWon(rentalForm.billingAmount) }}
            </div>
          </div>
        </div>

        <div class="form-actions">
          <!-- <button type="submit" class="btn btn-primary">PDF 생성</button> -->
          <button type="button" @click="submitRentalFormExcel" class="btn btn-primary">Excel 생성</button>
        </div>
      </form>
    </div>

    <!-- 월세 지원 품의서 폼 -->
    <div v-if="selectedDocumentType === 'rental_proposal'" class="form-container">
      <h2>월세 지원 품의서</h2>
      <form @submit.prevent="submitRentalProposalForm" class="form">
        <div class="form-group">
          <label>신청일자 (품의 일자) <span class="required">*</span></label>
          <input type="date" v-model="rentalProposalForm.requestDate" required />
        </div>

        <div class="form-group">
          <label>소속 <span class="required">*</span></label>
          <div class="department-select-group">
            <select
              v-model="rentalProposalForm.departmentDivision"
              @change="rentalProposalForm.departmentTeam = ''"
              required
              class="department-select"
            >
              <option value="">본부/센터 선택</option>
              <option value="ITO센터">ITO센터</option>
              <option value="신사업추진실">신사업추진실</option>
              <option value="솔루션사업본부">솔루션사업본부</option>
              <option value="플랫폼사업본부">플랫폼사업본부</option>
              <option value="서비스사업본부">서비스사업본부</option>
              <option value="시스템사업본부">시스템사업본부</option>
            </select>
            <select
              v-model="rentalProposalForm.departmentTeam"
              :disabled="!rentalProposalForm.departmentDivision"
              required
              class="department-select"
            >
              <option value="">팀 선택</option>
              <option
                v-for="team in getTeamsForDivision(rentalProposalForm.departmentDivision)"
                :key="team"
                :value="team"
              >
                {{ team }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>신청자 (기안자) <span class="required">*</span></label>
          <input type="text" v-model="rentalProposalForm.applicant" required />
        </div>

        <div class="form-group">
          <label>기존 거주지 주소</label>
          <input type="text" v-model="rentalProposalForm.currentAddress" />
        </div>

        <div class="form-group">
          <label>월세 계약 주소</label>
          <input type="text" v-model="rentalProposalForm.rentalAddress" />
        </div>

        <div class="form-group">
          <label class="label-with-help">
            월세 계약 시작일 <span class="required">*</span>
            <button
              type="button"
              class="help-button"
              @click="showHelpModal('prop_period')"
              aria-label="도움말"
            >
              ?
            </button>
          </label>
          <input type="date" v-model="rentalProposalForm.contractStartDate" required />
        </div>

        <div v-if="rentalProposalForm.contractStartDate" class="form-group">
          <label>계약 단위 <span class="required">*</span></label>
          <select v-model="rentalProposalForm.contractTermUnit" required class="form-select">
            <option value="">선택</option>
            <option value="1년">1년</option>
            <option value="2년">2년</option>
            <option value="직접입력">직접입력</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label-with-help">
            월세 계약 종료일 <span class="required">*</span>
            <button
              type="button"
              class="help-button"
              @click="showHelpModal('prop_period')"
              aria-label="도움말"
            >
              ?
            </button>
          </label>
          <input
            type="date"
            v-model="rentalProposalForm.contractEndDate"
            :disabled="rentalProposalForm.contractTermUnit !== '직접입력' && rentalProposalForm.contractTermUnit !== ''"
            required
          />
        </div>

        <div class="form-group">
          <label class="label-with-help">
            계약 월세 금액(원) <span class="required">*</span>
            <button
              type="button"
              class="help-button"
              @click="showHelpModal('prop_amount')"
              aria-label="도움말"
            >
              ?
            </button>
          </label>
          <div class="input-with-unit">
            <input
              type="text"
              v-model="rentalProposalForm.contractMonthlyRent"
              @input="handleNumberInput($event, 'proposal_contractMonthlyRent')"
              @keypress="handleKeyPress"
              required
            />
            <div v-if="rentalProposalForm.contractMonthlyRent >= 10000" class="unit-text-below">
              {{ formatKoreanWon(rentalProposalForm.contractMonthlyRent) }}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>월세 청구 금액(원) <span class="required">*</span></label>
          <div class="input-with-unit">
            <input
              type="text"
              v-model="rentalProposalForm.billingAmount"
              @input="handleNumberInput($event, 'proposal_billingAmount')"
              @keypress="handleKeyPress"
              required
            />
            <div v-if="rentalProposalForm.billingAmount >= 10000" class="unit-text-below">
              {{ formatKoreanWon(rentalProposalForm.billingAmount) }}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="label-with-help">
            월세 청구 개시일 <span class="required">*</span>
            <button
              type="button"
              class="help-button"
              @click="showHelpModal('prop_billingstart')"
              aria-label="도움말"
            >
              ?
            </button>
          </label>
          <input type="date" v-model="rentalProposalForm.billingStartDate" required />
        </div>

        <div class="form-group">
          <label>월세 청구 사유</label>
          <textarea v-model="rentalProposalForm.reason" rows="3"></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">DOCX 생성</button>
        </div>
      </form>
    </div>

    <!-- 업무 관련 개인비용 청구서 폼 -->
    <div v-if="selectedDocumentType === 'expense_claim'" class="form-container">
      <h2>업무 관련 개인비용 청구서</h2>
      <form @submit.prevent="submitExpenseClaimForm" class="form">
        <div class="form-group">
          <label>신청일자 <span class="required">*</span></label>
          <input type="date" v-model="expenseClaimForm.requestDate" required />
        </div>

        <div class="form-group">
          <label>청구 월 <span class="required">*</span></label>
          <select v-model.number="expenseClaimForm.month" required class="form-select">
            <option :value="null">월 선택</option>
            <option v-for="month in 12" :key="month" :value="month">
              {{ month }}월
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>소속 <span class="required">*</span></label>
          <div class="department-select-group">
            <select
              v-model="expenseClaimForm.departmentDivision"
              @change="expenseClaimForm.departmentTeam = ''"
              required
              class="department-select"
            >
              <option value="">본부/센터 선택</option>
              <option value="ITO센터">ITO센터</option>
              <option value="신사업추진실">신사업추진실</option>
              <option value="솔루션사업본부">솔루션사업본부</option>
              <option value="플랫폼사업본부">플랫폼사업본부</option>
              <option value="서비스사업본부">서비스사업본부</option>
              <option value="시스템사업본부">시스템사업본부</option>
            </select>
            <select
              v-model="expenseClaimForm.departmentTeam"
              :disabled="!expenseClaimForm.departmentDivision"
              required
              class="department-select"
            >
              <option value="">팀 선택</option>
              <option
                v-for="team in getTeamsForDivision(expenseClaimForm.departmentDivision)"
                :key="team"
                :value="team"
              >
                {{ team }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>신청자 <span class="required">*</span></label>
          <input type="text" v-model="expenseClaimForm.applicant" required />
        </div>

        <!-- 비용 항목 목록 -->
        <div class="expense-items-section">
          <h3 class="label-with-help">
            비용 항목 목록 <span class="required">*</span>
            <button
              type="button"
              class="help-button"
              @click="showHelpModal('expense')"
              aria-label="도움말"
            >
              ?
            </button>
          </h3>
          <div
            v-for="(item, index) in expenseClaimForm.expenseItems"
            :key="index"
            class="expense-item"
          >
            <h4>항목 {{ index + 1 }}</h4>
            <div class="expense-item-grid">
              <div class="form-group">
                <label>일자</label>
                <input type="date" v-model="item.date" />
              </div>
              <div class="form-group">
                <label>사용 내역</label>
                <input type="text" v-model="item.usageDetail" />
              </div>
              <div class="form-group">
                <label>거래처</label>
                <input type="text" v-model="item.vendor" />
              </div>
              <div class="form-group">
                <label>결재방법</label>
                <input type="text" v-model="item.paymentMethod" />
              </div>
              <div class="form-group">
                <label>프로젝트</label>
                <input type="text" v-model="item.project" />
              </div>
              <div class="form-group">
                <label>금액(원)</label>
                <div class="input-with-unit">
                  <input
                    type="text"
                    :value="item.amount || ''"
                    @input="handleExpenseAmountInput($event, index)"
                    @keypress="handleKeyPress"
                  />
                  <div v-if="item.amount && item.amount >= 10000" class="unit-text-below">
                    {{ formatKoreanWon(item.amount) }}
                  </div>
                </div>
              </div>
              <div class="form-group full-width">
                <label>비고</label>
                <input type="text" v-model="item.note" />
              </div>
            </div>
            <button type="button" @click="removeExpenseItem(index)" class="btn btn-danger btn-sm">
              삭제
            </button>
          </div>
          <button
            type="button"
            @click="addExpenseItem"
            class="btn btn-secondary"
            :disabled="expenseClaimForm.expenseItems.length >= 20"
          >
            항목 추가
          </button>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Excel 생성</button>
        </div>
      </form>
    </div>

    <!-- 도서 구입 신청서 (disabled) -->
    <div v-if="selectedDocumentType === 'book_purchase'" class="form-container">
      <h2>도서 구입 신청서</h2>
      <p class="disabled-message">준비 중입니다.</p>
    </div>

    <!-- 도움말 모달 -->
    <HelpModal
      :is-open="helpModal.isOpen"
      :image-src="helpModal.imageSrc"
      alt-text="월세 계약 기간 도움말"
      @close="closeHelpModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import apiClient from '@/api/axios'
import logoVerticalImage from '@/assets/image/logo/KP_CI_vertical.png'
import HelpModal from '@/components/HelpModal.vue'
import rentalContPeriodImage from '@/assets/image/help/rental_cont_period.png'
import rentalContractPriceImage from '@/assets/image/help/rental_contract_price.png'
import rentalBillingStartDateImage from '@/assets/image/help/rental_billing_startdate.png'
import rentalBillingPeriodImage from '@/assets/image/help/rental_billing_period.png'
import rentalPaymentDateImage from '@/assets/image/help/rental_paymentDate.png'
import propPeriodImage from '@/assets/image/help/prop_period.png'
import propAmountImage from '@/assets/image/help/prop_amount.png'
import propBillingStartImage from '@/assets/image/help/prop_billingStart.png'
import expenseImage from '@/assets/image/help/expense.png'

// 소속 데이터 구조
const departmentStructure: Record<string, string[]> = {
  'ITO센터': ['ITO지원팀'],
  '신사업추진실': ['크레이이티브팀'],
  '솔루션사업본부': ['솔루션1팀', '솔루션2팀'],
  '플랫폼사업본부': ['플랫폼1팀', '플랫폼2팀'],
  '서비스사업본부': ['서비스1팀', '서비스2팀'],
  '시스템사업본부': ['시스템1팀', '시스템2팀']
}

// 본부/센터에 따른 팀 목록 반환
const getTeamsForDivision = (division: string): string[] => {
  return departmentStructure[division] || []
}

// 문서 타입 정의
interface DocumentType {
  value: string
  label: string
  disabled: boolean
}

const documentTypes: DocumentType[] = [
  { value: 'vacation', label: '휴가 결무 신청서', disabled: false },
  { value: 'rental', label: '월세 지원 청구서', disabled: false },
  { value: 'rental_proposal', label: '월세 지원 품의서', disabled: false },
  { value: 'expense_claim', label: '업무 관련 개인비용 청구서', disabled: false },
  { value: 'book_purchase', label: '도서 구입 신청서', disabled: true }
]

// 선택된 문서 타입
const selectedDocumentType = ref<string>('vacation')

// 도움말 모달 상태
const helpModal = reactive<{
  isOpen: boolean
  imageSrc: string
}>({
  isOpen: false,
  imageSrc: ''
})

// 도움말 이미지 맵
const helpImageMap: Record<string, string> = {
  rental_cont_period: rentalContPeriodImage,
  rental_contract_price: rentalContractPriceImage,
  rental_billing_startdate: rentalBillingStartDateImage,
  rental_billing_period: rentalBillingPeriodImage,
  rental_payment_date: rentalPaymentDateImage,
  prop_period: propPeriodImage,
  prop_amount: propAmountImage,
  prop_billingstart: propBillingStartImage,
  expense: expenseImage
}

// 도움말 모달 열기
const showHelpModal = (imageKey: string) => {
  helpModal.imageSrc = helpImageMap[imageKey] || ''
  helpModal.isOpen = true
}

// 도움말 모달 닫기
const closeHelpModal = () => {
  helpModal.isOpen = false
}

// 휴가 결무 신청서 폼 데이터
const vacationForm = reactive({
  requestDate: '',
  departmentDivision: '',
  departmentTeam: '',
  applicant: '',
  startDate: '',
  endDate: '',
  vacationType: '',
  reason: '',
  totalVacationDays: 0,
  remainingVacationDays: 0,
  requestedVacationDays: 0
})

// 시작일과 종료일이 같은지 확인
const isSameDay = computed(() => {
  if (!vacationForm.startDate || !vacationForm.endDate) {
    return false
  }
  return vacationForm.startDate === vacationForm.endDate
})

// 시작일과 종료일이 다를 때 자동 계산된 신청일수
const calculatedVacationDays = computed(() => {
  if (!vacationForm.startDate || !vacationForm.endDate) {
    return 0
  }
  
  if (isSameDay.value) {
    return vacationForm.requestedVacationDays || 0
  }
  
  const start = new Date(vacationForm.startDate)
  const end = new Date(vacationForm.endDate)
  
  // 날짜 차이 계산 (밀리초를 일수로 변환)
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // 시작일 포함
  
  return diffDays
})

// 시작일과 종료일이 변경될 때 신청일수 자동 업데이트
watch([() => vacationForm.startDate, () => vacationForm.endDate], () => {
  if (!isSameDay.value && vacationForm.startDate && vacationForm.endDate) {
    vacationForm.requestedVacationDays = calculatedVacationDays.value
  } else if (isSameDay.value) {
    // 같은 날이면 초기화 (사용자가 선택하도록)
    vacationForm.requestedVacationDays = 0
  }
})

// 휴가 구분과 한글 매핑
const vacationTypeMap: Record<string, string> = {
  'YEONCHA': '개인 사정',
  'GYEONGJO': '경조',
  'CHULSAN': '출산',
  'GYEOLGEUN': '결근',
  'BYEONGGA': '병가',
  'GITA': '기타',
  'YEBIGUN': '예비군'
}

// 휴가 구분이 변경될 때 사유 자동 입력
watch(() => vacationForm.vacationType, (newType) => {
  if (newType && vacationTypeMap[newType]) {
    vacationForm.reason = vacationTypeMap[newType]
  } else if (!newType) {
    vacationForm.reason = ''
  }
})

// 월세 지원 청구서 폼 데이터
const rentalForm = reactive({
  requestDate: '',
  month: null,
  departmentDivision: '',
  departmentTeam: '',
  applicant: '',
  contractStartDate: '',
  contractTermUnit: '', // 1년, 2년, 직접입력
  contractEndDate: '',
  contractMonthlyRent: 0,
  paymentType: 'POSTPAID', // 후불이 기본값
  billingStartDate: '',
  billingPeriodStartDate: '',
  billingPeriodEndDate: '',
  paymentDate: '',
  paymentAmount: 0,
  billingAmount: 0
})

// 숫자를 한글 만원 단위로 변환 (만원 이상일 때 백원 단위까지 표시)
const formatKoreanWon = (amount: number): string => {
  if (!amount || amount < 10000) {
    return ''
  }

  const man = Math.floor(amount / 10000) // 만원 단위
  const remainder = amount % 10000 // 나머지 금액 (백원 단위로 표시)
  const koreanNumbers = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

  // 만원 단위 문자열 생성
  let manStr = ''
  if (man === 1) {
    manStr = '만'
  } else if (man < 10) {
    manStr = koreanNumbers[man] + '만'
  } else if (man < 100) {
    const ten = Math.floor(man / 10)
    const one = man % 10
    if (ten === 1) {
      manStr = one > 0 ? '십' + koreanNumbers[one] + '만' : '십만'
    } else {
      manStr = koreanNumbers[ten] + '십' + (one > 0 ? koreanNumbers[one] : '') + '만'
    }
  } else if (man < 1000) {
    const hundred = Math.floor(man / 100)
    const remainder2 = man % 100
    manStr = koreanNumbers[hundred] + '백'
    if (remainder2 > 0) {
      const ten = Math.floor(remainder2 / 10)
      const one = remainder2 % 10
      if (ten > 0) {
        manStr += ten === 1 ? '십' : koreanNumbers[ten] + '십'
      }
      if (one > 0) {
        manStr += koreanNumbers[one]
      }
    }
    manStr += '만'
  } else if (man < 10000) {
    const thousand = Math.floor(man / 1000)
    const remainder2 = man % 1000
    manStr = koreanNumbers[thousand] + '천'
    if (remainder2 > 0) {
      const hundred = Math.floor(remainder2 / 100)
      const remainder3 = remainder2 % 100
      if (hundred > 0) {
        manStr += koreanNumbers[hundred] + '백'
      }
      if (remainder3 > 0) {
        const ten = Math.floor(remainder3 / 10)
        const one = remainder3 % 10
        if (ten > 0) {
          manStr += ten === 1 ? '십' : koreanNumbers[ten] + '십'
        }
        if (one > 0) {
          manStr += koreanNumbers[one]
        }
      }
    }
    manStr += '만'
  } else {
    // 만만원 이상
    const eok = Math.floor(man / 10000)
    const remainder2 = man % 10000
    manStr = koreanNumbers[eok] + '억'
    if (remainder2 > 0) {
      // 재귀 호출로 만원 단위 처리
      const tempAmount = remainder2 * 10000
      const tempMan = Math.floor(tempAmount / 10000)
      if (tempMan === 1) {
        manStr += '만'
      } else if (tempMan < 10) {
        manStr += koreanNumbers[tempMan] + '만'
      } else if (tempMan < 100) {
        const ten = Math.floor(tempMan / 10)
        const one = tempMan % 10
        if (ten === 1) {
          manStr += one > 0 ? '십' + koreanNumbers[one] + '만' : '십만'
        } else {
          manStr += koreanNumbers[ten] + '십' + (one > 0 ? koreanNumbers[one] : '') + '만'
        }
      } else if (tempMan < 1000) {
        const hundred = Math.floor(tempMan / 100)
        const remainder3 = tempMan % 100
        manStr += koreanNumbers[hundred] + '백'
        if (remainder3 > 0) {
          const ten = Math.floor(remainder3 / 10)
          const one = remainder3 % 10
          if (ten > 0) {
            manStr += ten === 1 ? '십' : koreanNumbers[ten] + '십'
          }
          if (one > 0) {
            manStr += koreanNumbers[one]
          }
        }
        manStr += '만'
      } else {
        const thousand = Math.floor(tempMan / 1000)
        const remainder3 = tempMan % 1000
        manStr += koreanNumbers[thousand] + '천'
        if (remainder3 > 0) {
          const hundred = Math.floor(remainder3 / 100)
          const remainder4 = remainder3 % 100
          if (hundred > 0) {
            manStr += koreanNumbers[hundred] + '백'
          }
          if (remainder4 > 0) {
            const ten = Math.floor(remainder4 / 10)
            const one = remainder4 % 10
            if (ten > 0) {
              manStr += ten === 1 ? '십' : koreanNumbers[ten] + '십'
            }
            if (one > 0) {
              manStr += koreanNumbers[one]
            }
          }
        }
        manStr += '만'
      }
    } else {
      manStr += '만'
    }
  }

  // 나머지 금액을 천원, 백원 단위로 변환
  let remainderStr = ''
  if (remainder > 0) {
    const cheon = Math.floor(remainder / 1000) // 천원 단위
    const remainderAfterCheon = remainder % 1000 // 천원 제외한 나머지
    const baek = Math.floor(remainderAfterCheon / 100) // 백원 단위
    
    // 천원 단위 처리
    if (cheon > 0) {
      if (cheon === 1) {
        remainderStr = '천'
      } else {
        remainderStr = koreanNumbers[cheon] + '천'
      }
    }
    
    // 백원 단위 처리
    if (baek > 0) {
      if (baek === 1) {
        remainderStr += '백'
      } else {
        remainderStr += koreanNumbers[baek] + '백'
      }
    }
  }

  return manStr + remainderStr + '원'
}

// 숫자만 입력되도록 키 입력 차단
const handleKeyPress = (event: KeyboardEvent) => {
  const char = String.fromCharCode(event.which || event.keyCode)
  if (!/[0-9]/.test(char)) {
    event.preventDefault()
  }
}

// 숫자만 입력하도록 처리 (붙여넣기 등 대비)
const handleNumberInput = (event: Event, field: string) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '') // 숫자만 남기기
  const numValue = value ? Number(value) : 0
  
  if (field === 'contractMonthlyRent') {
    rentalForm.contractMonthlyRent = numValue
    target.value = value || '' // 숫자만 표시, 빈 값이면 빈 문자열
  } else if (field === 'paymentAmount') {
    rentalForm.paymentAmount = numValue
    target.value = value || ''
  } else if (field === 'billingAmount') {
    rentalForm.billingAmount = numValue
    target.value = value || ''
  } else if (field === 'proposal_contractMonthlyRent') {
    rentalProposalForm.contractMonthlyRent = numValue
    target.value = value || ''
  } else if (field === 'proposal_billingAmount') {
    rentalProposalForm.billingAmount = numValue
    target.value = value || ''
  }
}

// 비용 항목 금액 입력 처리
const handleExpenseAmountInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '') // 숫자만 남기기
  const numValue = value ? Number(value) : null
  
  if (expenseClaimForm.expenseItems[index]) {
    expenseClaimForm.expenseItems[index].amount = numValue
  }
  target.value = value || '' // 숫자만 표시, 빈 값이면 빈 문자열
}

// 계약 월세 금액이 변경될 때 자동 계산
watch(() => rentalForm.contractMonthlyRent, (newValue) => {
  if (newValue && newValue > 0) {
    // 월세 납입 금액 = 계약 월세 금액
    rentalForm.paymentAmount = newValue
    
    // 월세 청구 금액 계산
    // 50만원 초과면 최대 25만원, 그 외는 1/2
    if (newValue > 500000) {
      rentalForm.billingAmount = 250000
    } else {
      rentalForm.billingAmount = Math.floor(newValue / 2)
    }
  }
})

// 월세 지원 품의서 폼 데이터
const rentalProposalForm = reactive({
  requestDate: '',
  departmentDivision: '',
  departmentTeam: '',
  applicant: '',
  currentAddress: '',
  rentalAddress: '',
  contractStartDate: '',
  contractTermUnit: '', // 1년, 2년, 직접입력
  contractEndDate: '',
  contractMonthlyRent: 0,
  billingAmount: 0,
  billingStartDate: '',
  reason: ''
})

// 월세 지원 청구서: 계약 시작일이 변경될 때 청구 개시일 자동 설정
watch(() => rentalForm.contractStartDate, (newValue) => {
  if (newValue) {
    rentalForm.billingStartDate = newValue
  }
})

// 월세 지원 청구서: 계약 시작일과 계약 단위가 변경될 때 종료일 자동 계산
watch([() => rentalForm.contractStartDate, () => rentalForm.contractTermUnit], ([startDate, termUnit]) => {
  if (startDate && termUnit && termUnit !== '직접입력') {
    const start = new Date(startDate + 'T00:00:00') // 로컬 시간으로 처리
    const years = termUnit === '1년' ? 1 : 2
    const end = new Date(start)
    end.setFullYear(start.getFullYear() + years)
    end.setDate(end.getDate() - 1) // 종료일은 시작일 + N년 - 1일 (예: 2024-01-01 + 1년 = 2024-12-31)
    
    const year = end.getFullYear()
    const month = String(end.getMonth() + 1).padStart(2, '0')
    const day = String(end.getDate()).padStart(2, '0')
    rentalForm.contractEndDate = `${year}-${month}-${day}`
  } else if (termUnit === '직접입력') {
    // 직접입력으로 변경되면 종료일은 그대로 유지 (사용자가 입력)
  }
})

// 품의서: 계약 시작일이 변경될 때 청구 개시일 자동 설정
watch(() => rentalProposalForm.contractStartDate, (newValue) => {
  if (newValue) {
    rentalProposalForm.billingStartDate = newValue
  }
})

// 품의서: 계약 시작일과 계약 단위가 변경될 때 종료일 자동 계산
watch([() => rentalProposalForm.contractStartDate, () => rentalProposalForm.contractTermUnit], ([startDate, termUnit]) => {
  if (startDate && termUnit && termUnit !== '직접입력') {
    const start = new Date(startDate + 'T00:00:00') // 로컬 시간으로 처리
    const years = termUnit === '1년' ? 1 : 2
    const end = new Date(start)
    end.setFullYear(start.getFullYear() + years)
    end.setDate(end.getDate() - 1) // 종료일은 시작일 + N년 - 1일 (예: 2024-01-01 + 1년 = 2024-12-31)
    
    const year = end.getFullYear()
    const month = String(end.getMonth() + 1).padStart(2, '0')
    const day = String(end.getDate()).padStart(2, '0')
    rentalProposalForm.contractEndDate = `${year}-${month}-${day}`
  } else if (termUnit === '직접입력') {
    // 직접입력으로 변경되면 종료일은 그대로 유지 (사용자가 입력)
  }
})

// 품의서: 계약 월세 금액이 변경될 때 자동 계산
watch(() => rentalProposalForm.contractMonthlyRent, (newValue) => {
  if (newValue && newValue > 0) {
    // 월세 청구 금액 계산
    // 50만원 초과면 최대 25만원, 그 외는 50%
    if (newValue > 500000) {
      rentalProposalForm.billingAmount = 250000
    } else {
      rentalProposalForm.billingAmount = Math.floor(newValue / 2)
    }
  }
})

// 업무 관련 개인비용 청구서 폼 데이터
interface ExpenseItem {
  date: string
  usageDetail: string
  vendor: string
  paymentMethod: string
  project: string
  amount: number | null
  note: string
}

const expenseClaimForm = reactive<{
  requestDate: string
  month: number | null
  departmentDivision: string
  departmentTeam: string
  applicant: string
  expenseItems: ExpenseItem[]
}>({
  requestDate: '',
  month: null,
  departmentDivision: '',
  departmentTeam: '',
  applicant: '',
  expenseItems: [
    {
      date: '',
      usageDetail: '',
      vendor: '',
      paymentMethod: '',
      project: '',
      amount: null,
      note: ''
    }
  ]
})

// 비용 항목 추가 (최대 20개)
const addExpenseItem = () => {
  if (expenseClaimForm.expenseItems.length < 20) {
    expenseClaimForm.expenseItems.push({
      date: '',
      usageDetail: '',
      vendor: '',
      paymentMethod: '',
      project: '',
      amount: null,
      note: ''
    })
  }
}

// 비용 항목 삭제
const removeExpenseItem = (index: number) => {
  if (expenseClaimForm.expenseItems.length > 1) {
    expenseClaimForm.expenseItems.splice(index, 1)
  }
}

// 파일 다운로드 헬퍼 함수
const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// 소속 필드 합치기 헬퍼 함수
const combineDepartment = (division: string, team: string): string => {
  if (!division || !team) return ''
  return `${division}/${team}`
}

// 에러 메시지 파싱 및 표시 헬퍼 함수
const handleError = async (error: unknown, defaultMessage: string) => {
  console.error('에러 발생:', error)
  
  try {
    // axios 에러인 경우
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown; status?: number } }
      
      // responseType이 'blob'일 때 에러 응답도 blob으로 올 수 있음
      if (axiosError.response?.data instanceof Blob) {
        const text = await axiosError.response.data.text()
        try {
          const errorData = JSON.parse(text)
          showErrorAlert(errorData)
          return
        } catch {
          // JSON 파싱 실패 시 기본 메시지
        }
      } else if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
        // 일반 JSON 응답
        showErrorAlert(axiosError.response.data)
        return
      }
    }
    
    // 일반 Error 객체인 경우
    if (error instanceof Error) {
      console.error('에러 상세:', error.message)
    }
    
    // 기본 메시지 표시
    alert(defaultMessage)
  } catch (parseError) {
    console.error('에러 파싱 실패:', parseError)
    alert(defaultMessage)
  }
}

// 에러 알림 표시 함수
const showErrorAlert = (errorData: any) => {
  let errorMessage = errorData.errorMessage || '요청 처리 중 오류가 발생했습니다.'
  
  // 검증 에러가 있는 경우 상세 메시지 추가
  if (errorData.errors && typeof errorData.errors === 'object') {
    const errorDetails: string[] = []
    for (const message of Object.values(errorData.errors)) {
      if (typeof message === 'string') {
        errorDetails.push(message)
      }
    }
    
    if (errorDetails.length > 0) {
      errorMessage += '\n\n' + errorDetails.join('\n')
    }
  }
  
  alert(errorMessage)
}

// 휴가 결무 신청서 - PDF 생성
// const submitVacationForm = async () => {
//   try {
//     const { departmentDivision, departmentTeam, ...rest } = vacationForm
//     const requestData = {
//       ...rest,
//       department: combineDepartment(departmentDivision, departmentTeam)
//     }

//     const response = await apiClient.post('/sample/vacation', requestData, {
//       responseType: 'blob'
//     })
    
//     console.log('PDF 생성 성공:', {
//       size: response.data.size,
//       type: response.data.type
//     })

//     const blob = new Blob([response.data], { type: 'application/pdf' })
//     downloadFile(blob, 'vacation-application.pdf')
//   } catch (error) {
//     await handleError(error, 'PDF 생성에 실패했습니다.')
//   }
// }

// 휴가 결무 신청서 - DOCX 생성
const submitVacationFormDocx = async () => {
  try {
    const { departmentDivision, departmentTeam, ...rest } = vacationForm
    const requestData = {
      ...rest,
      department: combineDepartment(departmentDivision, departmentTeam)
    }

    const response = await apiClient.post('/sample/vacation_V2', requestData, {
      responseType: 'blob'
    })
    
    console.log('✅ DOCX 생성 성공:', {
      size: response.data.size,
      type: response.data.type
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    downloadFile(blob, 'vacation-application.docx')
  } catch (error) {
    await handleError(error, 'DOCX 생성에 실패했습니다.')
  }
}

// 월세 지원 청구서 - PDF 생성
// const submitRentalForm = async () => {
//   try {
//     const { departmentDivision, departmentTeam, ...rest } = rentalForm
//     const requestData = {
//       ...rest,
//       department: combineDepartment(departmentDivision, departmentTeam)
//     }
//     console.log('📤 월세 지원 청구서 PDF 생성 요청:', requestData)

//     const response = await apiClient.post('/sample/rental', requestData, {
//       responseType: 'blob'
//     })
    
//     console.log('✅ PDF 생성 성공:', {
//       size: response.data.size,
//       type: response.data.type
//     })

//     const blob = new Blob([response.data], { type: 'application/pdf' })
//     downloadFile(blob, 'rental-support-application.pdf')
//   } catch (error) {
//     await handleError(error, 'PDF 생성에 실패했습니다.')
//   }
// }

// 월세 지원 청구서 - Excel 생성
const submitRentalFormExcel = async () => {
  try {
    const { departmentDivision, departmentTeam, contractTermUnit, ...rest } = rentalForm
    const requestData = {
      ...rest,
      department: combineDepartment(departmentDivision, departmentTeam)
    }

    const response = await apiClient.post('/sample/rental_V2', requestData, {
      responseType: 'blob'
    })
    
    console.log('✅ Excel 생성 성공:', {
      size: response.data.size,
      type: response.data.type
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    downloadFile(blob, 'rental-support-application.xlsx')
  } catch (error) {
    await handleError(error, 'Excel 생성에 실패했습니다.')
  }
}

// 월세 지원 품의서 - DOCX 생성
const submitRentalProposalForm = async () => {
  try {
    const { departmentDivision, departmentTeam, contractTermUnit, ...rest } = rentalProposalForm
    const requestData = {
      ...rest,
      department: combineDepartment(departmentDivision, departmentTeam)
    }

    const response = await apiClient.post('/sample/rental_proposal', requestData, {
      responseType: 'blob'
    })
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    downloadFile(blob, 'rental-support-proposal.docx')
  } catch (error) {
    await handleError(error, 'DOCX 생성에 실패했습니다.')
  }
}

// 업무 관련 개인비용 청구서 - Excel 생성
const submitExpenseClaimForm = async () => {
  try {
    const { departmentDivision, departmentTeam, ...rest } = expenseClaimForm
    const requestData = {
      ...rest,
      department: combineDepartment(departmentDivision, departmentTeam)
    }

    const response = await apiClient.post('/sample/expense_claim', requestData, {
      responseType: 'blob'
    })
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    downloadFile(blob, 'expense-claim.xlsx')
  } catch (error) {
    await handleError(error, 'Excel 생성에 실패했습니다.')
  }
}
</script>

<style scoped>
.sample-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 2rem;
}

.header-logo {
  max-width: 200px;
  height: auto;
  margin-bottom: 1.5rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

h2 {
  margin-bottom: 1.5rem;
  color: #42b983;
  border-bottom: 2px solid #42b983;
  padding-bottom: 0.5rem;
}

h3 {
  margin: 1.5rem 0 1rem;
  color: #666;
}

.document-type-selection {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 1rem;
  background-color: white;
  border: 2px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s;
}

.radio-label:hover:not(:has(input:disabled)) {
  border-color: #42b983;
  background-color: #f0fdf4;
}

.radio-input {
  margin-right: 0.5rem;
}

.radio-label span.disabled {
  color: #999;
  cursor: not-allowed;
}

.form-container {
  margin-top: 2rem;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.label-with-help {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.help-button {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #42b983;
  background-color: white;
  color: #42b983;
  font-size: 0.875rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.help-button:hover {
  background-color: #42b983;
  color: white;
  transform: scale(1.1);
}

.help-button:active {
  transform: scale(0.95);
}

.form-group .required {
  color: #e74c3c;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.department-select-group {
  display: flex;
  gap: 0.5rem;
}

.department-select {
  flex: 1;
}

.department-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.readonly-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #666;
}

.input-with-unit {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.input-with-unit input {
  width: 100%;
}

.unit-text-below {
  color: #42b983;
  font-weight: 500;
  font-size: 0.85rem;
  text-align: right;
  padding-right: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:hover {
  background-color: #35a372;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn:disabled:hover {
  background-color: #ccc;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.expense-items-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.expense-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.expense-item > button {
  margin-left: auto;
  display: block;
}

.expense-items-section > button {
  margin-left: auto;
  display: block;
}

.expense-item h4 {
  margin-bottom: 1rem;
  color: #42b983;
}

.expense-item-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.expense-item-grid .form-group.full-width {
  grid-column: 1 / -1;
}

.disabled-message {
  padding: 2rem;
  text-align: center;
  color: #999;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .expense-item-grid {
    grid-template-columns: 1fr;
  }

  .radio-group {
    flex-direction: column;
  }
}
</style>

