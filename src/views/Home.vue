<template>
  <a-table
    :dataSource="dataSource"
    :columns="columns"
    :scroll="{ x: 1500, y: 300 }"
  />
  <input
    ref="excel-upload-input"
    class="excel-upload-input"
    type="file"
    accept=".xlsx, .xls, .csv"
    multiple
    @change="handleClick"
  />
  <a-button @click="exportExcel">导出</a-button>
</template>

<script>
import XLSX from "xlsx";
import Export2Excel from '../plugin/Export2Excel';
export default {
  name: "Home",
  data() {
    return {
      fileList: [],
      columns: [],
      dataSource: [],
      fileList: [],
      json_fields: [],
    };
  },
  methods: {
    handleClick(e) {
      const files = e.target.files;
      for (let index = 0; index < files.length; index++) {
        const rawFile = files[index];
        this.upload(rawFile);
      }
    },
    upload(rawFile) {
      // this.$refs["excel-upload-input"].value = null; //
      let self = this;
      this.readerData(rawFile).then(({ header, results }) => {
        if (self.columns.length == 0) {
          header.forEach((headerItem, index) => {
            self.columns.push({
              title: headerItem,
              dataIndex: headerItem,
              key: headerItem + index,
              width: 150,
            });
            self.json_fields.push({
              headerItem
            });
          });
        }
        if (header.length === self.columns.length) {
          let length = self.dataSource.length;
          results.forEach((item, index) => {
            item.key = length + index;
            self.dataSource.push(item);
          });
        }
      });
    },
    readerData(rawFile) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        //使用FileReader对象, FileReader通过异步的方式读取文件内容，结果均是通过事件回调获取
        reader.onload = (e) => {
          const data = e.target.result;
          // 获取workbook对象，读取excel主要是通过XLSX.read(data, {type: type});方法来实现，返回一个叫WorkBook的对象 type为array是 Uint8Array，8位无符号数组
          // debugger;
          const workbook = XLSX.read(data, { type: "array" });
          const sheetNames = workbook.SheetNames;
          sheetNames.forEach((sheetNameItem, index) => {
            const worksheet = workbook.Sheets[sheetNameItem]; // 获取第一个Sheet的数据
            const results = XLSX.utils.sheet_to_json(worksheet); // 输出JSON格式
            const header = this.getHeaderRow(worksheet);
            // this.generateData({ header, results }); // 处理数据
            resolve({ header, results });
          });
        };
        reader.onerror = (e) => {
          console.log(e, "4");
          reject(e);
        };
        // 以ArrayBuffer方式打开文件  读取本地文件
        reader.readAsArrayBuffer(rawFile);
      });
    },
    // 获取表头row
    getHeaderRow(sheet) {
      const headers = [];
      const range = XLSX.utils.decode_range(sheet["!ref"]); //sheet['!ref']：表示所有单元格的范围，例如从A1到F8则记录为A1:F8
      let C;
      const R = range.s.r;
      /* start in the first row */
      for (C = range.s.c; C <= range.e.c; ++C) {
        /* walk every column in the range */
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
        /* find the cell in the first row */
        let hdr = "UNKNOWN " + C; // <-- replace with your desired default
        if (cell && cell.t) hdr = XLSX.utils.format_cell(cell);
        headers.push(hdr);
      }
      return headers;
    },

    show({ results, header }) {
      this.tableData = results;
      this.tableHeader = header;
    },
    generateData({ header, results }) {
      this.excelData.header = header;
      this.excelData.results = results;
      this.show && this.show(this.excelData);
    },
    exportExcel() {
      const excelHeader = this.columns.map((item) => item.title);
      const keys = this.columns.map((item) => item.dataIndex);
      const excelData = this.dataSource.map((item) => {
        keys.map((i) => item[i] || "");
      });
      let sheet = XLSX.utils.json_to_sheet(this.dataSource);
      let blob = Export2Excel.sheet2blob(sheet);
      Export2Excel.openDownloadDialog(blob, '导出Excel.xls');
    },
  },
};
</script>

<style>
</style>