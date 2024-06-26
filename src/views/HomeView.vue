<script setup>
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Dropdown from 'primevue/dropdown'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import { computed, onMounted, ref, watch } from 'vue'
import { read, writeFileXLSX, utils } from 'xlsx'

onMounted(async () => {
  const response = await fetch('./launch.json')
  const data = await response.json()
  datatable.value = data
})

const drawResult = ref([])
const datatable = ref([])

const columns = ref([
  { field: 'id', header: '編號' },
  { field: 'name', header: '店名' },
  { field: 'type', header: '類型' },
  { field: 'score', header: '分數' },
  { field: 'count', header: '次數' },
  { field: 'weight', header: '權重' },
  { field: 'direction', header: '方向' }
])

const editedData = ref([])

const onCellEditComplete = (event) => {
  const { index, field, newValue } = event
  datatable.value[index][field] = newValue

  // 找到已編輯的數據，如果沒有則添加
  const existingItem = editedData.value.find((item) => item.index === index)
  if (existingItem) {
    existingItem[field] = newValue
  } else {
    editedData.value.push({ index, ...datatable.value[index] })
  }
}

const files = ref()
const fileInput = ref()

const mealType = ref('全部 type')
const mealTypeDropDown = computed(() => getDropDownlistItem('type'))

const direction = ref('全部 direction')
const directionDropDown = computed(() => getDropDownlistItem('direction'))

const score = ref('分數')
const scoreDropDown = ['分數', 1, 2, 3, 4, 5]

function getDropDownlistItem(datatableField) {
  const listitem = datatable.value.map((item) => item[datatableField])
  let dropDownList = [`全部 ${datatableField}`]
  dropDownList.push(...listitem.filter(distinct))

  return dropDownList
}

const dataFiltered = computed(() => {
  const filterByMealType =
    mealType.value === '全部 type'
      ? datatable.value.filter((item) => item.type !== '飲料')
      : datatable.value.filter((item) => item.type === mealType.value)
  const filterByDirection =
    direction.value === '全部 direction'
      ? filterByMealType
      : filterByMealType.filter((item) => item.direction === direction.value)
  const filterByScore = isNaN(score.value)
    ? filterByDirection
    : filterByDirection.filter((item) => item.score >= score.value)
  return filterByScore
})

async function fileOnChange(e) {
  const file = e.target.files[0]
  const fileName = file.name

  if (fileName.endsWith('.xlsx')) {
    const excel = await file.arrayBuffer()
    const workbook = read(excel)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = utils.sheet_to_json(worksheet)
    console.log(jsonData)

    datatable.value = jsonData
  }
  if (fileName.endsWith('.json')) {
    console.log('json!!')
  }
}

function dragEnter(e) {
  e.preventDefault()
}
function dragLeave(e) {
  e.preventDefault()
}
function dragOver(e) {
  e.preventDefault()
}
function dropFile(e) {
  e.preventDefault()
  const dropFiles = e.dataTransfer.files

  // DEBUG
  console.log(dropFiles)

  fileInput.value.value = dropFiles
}

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
  })

function downloadOnClick(fileType) {
  if (fileType === 'xlsx') {
    const worksheet = utils.json_to_sheet(datatable.value)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'nkjLaunch')
    writeFileXLSX(workbook, 'nkjLaunch.xlsx', { compression: true })
  }
  if (fileType === 'json') {
    let dlAnchorElem = document.getElementById('downloadAnchorElem')

    var dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(datatable.value))
    dlAnchorElem.setAttribute('href', dataStr)
    dlAnchorElem.setAttribute('download', 'launch.json')
    dlAnchorElem.click()
  }
}

function draw() {
  const index = Math.floor(Math.random() * dataFiltered.value.length)
  drawResult.value = [dataFiltered.value[index]]
}
function distinct(value, index, array) {
  return array.indexOf(value) === index
}
</script>

<template>
  <main>
    <div>
      <div
        id="dropzone"
        @dragenter="dragEnter"
        @dragleave="dragLeave"
        @dragover="dragOver"
        @drop="dropFile"
      >
        拖曳上傳資料
      </div>
      <div>上傳檔案:</div>
      <input type="file" @change="fileOnChange($event)" :ref="fileInput" />
      <div>下載檔案:</div>
      <Button label="下載Excel" type="button" @click="downloadOnClick('xlsx')"></Button>
      <Button label="下載json" type="button" @click="downloadOnClick('json')"></Button>
      <a id="downloadAnchorElem" style="display: none" :href="datatable" download="launch.json"></a>
    </div>
    <hr />
    <div>
      <Button label="抽選" type="button" @click="draw()">抽選</Button>
      <Dropdown v-model="mealType" :options="mealTypeDropDown" class="w-full md:w-14rem" />
      <Dropdown v-model="direction" :options="directionDropDown" class="w-full md:w-14rem" />
      <Dropdown v-model="score" :options="scoreDropDown" class="w-full md:w-14rem" />

      <DataTable :value="drawResult">
        <template #header>
          <h3>抽選結果</h3>
        </template>
        <Column
          v-for="col of columns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          style="width: 10%"
        >
          <template #body="{ data, field }">
            {{ data[field] }}
          </template>
        </Column>
      </DataTable>
    </div>

    <br />
    <hr />

    <DataTable
      :value="datatable"
      editMode="cell"
      paginator
      :rows="10"
      @cell-edit-complete="onCellEditComplete($event)"
      tableStyle="min-width: 50rem"
    >
      <template #header>
        <h2>記錄一覽</h2>
      </template>
      <Column
        v-for="col of columns"
        :key="col.field"
        :field="col.field"
        :header="col.header"
        style="width: 10%"
      >
        <template #body="{ data, field }">
          {{ data[field] }}
        </template>
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" autofocus />
        </template>
      </Column>
    </DataTable>
  </main>
</template>
<style scoped>
#dropzone {
  width: 300px;
  height: 200px;
  border: 2px dashed #ccc;
  text-align: center;
  line-height: 200px;
  font-size: 20px;
  color: #999;
}
</style>