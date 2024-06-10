<script setup>
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Dropdown from 'primevue/dropdown';
import Column from 'primevue/column'
import { computed, onMounted, ref, watch } from 'vue'
import { read, writeFileXLSX, utils } from "xlsx";

onMounted(async () => {
  const response = await fetch('./data.json')
  const data = await response.json()
  datatable.value = data
})

const datatable = ref([])
const drawResult = ref([])
const mealType = ref('')

const mealTypeDropDown = computed(() => {
  const mealType = datatable.value.map(item => item.type)
  return mealType.filter(distinct)
})
const dataFilteredByMealType = computed(() => {
  if (!mealType.value) {
    return datatable.value
  }
  return datatable.value.filter(item => item.type === mealType.value)
})

function draw() {
  const index = Math.floor(Math.random() * dataFilteredByMealType.value.length)
  drawResult.value = [dataFilteredByMealType.value[index]]
}
function distinct(value, index, array) {
  return array.indexOf(value) === index;
}
</script>

<template>
  <main>
    <div>
      <Button label="抽選" type="button" @click="draw()">抽選</Button>
      <Dropdown v-model="mealType" :options="mealTypeDropDown" placeholder="篩選餐點類型" class="w-full md:w-14rem">
      </Dropdown>

      <DataTable :value="drawResult" tableStyle="min-width: 50rem">
        <template #header>
          <h3>抽選結果</h3>
        </template>
        <Column field="name" header="名稱"></Column>
        <Column field="type" header="類型"></Column>
        <Column field="score" header="分數"></Column>
        <Column field="count" header="次數"></Column>
        <Column field="weight" header="權重"></Column>
      </DataTable>
    </div>

    <br />
    <hr />

    <DataTable :value="datatable" tableStyle="min-width: 50rem">
      <template #header>
        <h2>記錄一覽</h2>
      </template>
      <Column field="name" header="名稱"></Column>
      <Column field="type" header="類型"></Column>
      <Column field="score" header="分數"></Column>
      <Column field="count" header="次數"></Column>
      <Column field="weight" header="權重"></Column>
    </DataTable>
    <!-- <DataTable :value="products" tableStyle="min-width: 50rem">

    <Column field="name" header="Name"></Column>
    <Column header="Image">
        <template #body="slotProps">
            <img :src="`https://primefaces.org/cdn/primevue/images/product/${slotProps.data.image}`" :alt="slotProps.data.image" class="w-6rem border-round" />
        </template>
    </Column>
    <Column field="price" header="Price">
        <template #body="slotProps">
            {{ formatCurrency(slotProps.data.price) }}
        </template>
    </Column>
    <Column field="category" header="Category"></Column>
    <Column field="rating" header="Reviews">
        <template #body="slotProps">
            <Rating :modelValue="slotProps.data.rating" readonly :cancel="false" />
        </template>
    </Column>
    <Column header="Status">
        <template #body="slotProps">
            <Tag :value="slotProps.data.inventoryStatus" :severity="getSeverity(slotProps.data)" />
        </template>
    </Column>
    <template #footer> In total there are {{ products ? products.length : 0 }} products. </template>
</DataTable> -->
  </main>
</template>
