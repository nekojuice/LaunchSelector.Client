<script setup>
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Dropdown from 'primevue/dropdown';
import Column from 'primevue/column'
import { computed, onMounted, ref, watch } from 'vue'
import { read, writeFileXLSX, utils } from "xlsx";

onMounted(async () => {
  const response = await fetch('./launch.json')
  const data = await response.json()
  datatable.value = data
})

const datatable = ref([])
const drawResult = ref([])
const mealType = ref('全部類型')
const files = ref()
const fileInput = ref()

const mealTypeDropDown = computed(() => {
  const mealType = datatable.value.map(item => item.type)
  let dropDownList = ['全部類型']
  dropDownList.push(...mealType.filter(distinct))

  return dropDownList
})

const dataFilteredByMealType = computed(() => {
  return mealType.value === '全部類型' ? datatable.value : datatable.value.filter(item => item.type === mealType.value)
})



async function fileOnChange(e) {
  const file = e.target.files[0]
  const fileName = file.name

  if (fileName.endsWith('.xlsx')) {
    const excel = await file.arrayBuffer()
    const workbook = read(excel);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet)
    console.log(jsonData)

    datatable.value = jsonData
  }
  if (fileName.endsWith('.json')) {
    console.log('json!!')
  }
}

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});

function downloadOnClick(fileType) {
  if (fileType === 'xlsx') {
    const worksheet = utils.json_to_sheet(datatable.value);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "nkjLaunch");
    writeFileXLSX(workbook, "nkjLaunch.xlsx", { compression: true });
  }
  if (fileType === 'json') {
    let dlAnchorElem = document.getElementById('downloadAnchorElem');

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(datatable.value));
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "launch.json");
    dlAnchorElem.click();
  }
}

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
      <div>上傳檔案: </div>
      <input type="file" @change="fileOnChange($event)" :value="files" :ref="fileInput">
      <div>下載檔案: </div>
      <Button label="下載Excel" type="button" @click="downloadOnClick('xlsx')"></Button>
      <Button label="下載json" type="button" @click="downloadOnClick('json')"></Button>
      <a id="downloadAnchorElem" style="display:none" :href="datatable" download="launch.json"></a>
    </div>
    <hr>
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
        <Column field="direction" header="方向"></Column>
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
      <Column field="direction" header="方向"></Column>
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
