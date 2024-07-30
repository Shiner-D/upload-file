<template>
  <div class="main">
    <input type="file" @change="handleUpload" />
  </div>
</template>

<script>
import SparkMD5 from "spark-md5";
export default {
  name: "Upload-file",
  data() {
    return {
      CHUNK_SIZE: 1 * 1024 * 1024,
      THREAD_COUNT: navigator.hardwareConcurrency || 4, // 默认取计算机的处理器的核心数量
      fileHash: "",
      fileName: "",
    };
  },
  mounted() {},
  methods: {
    /**
     * 上传文件到服务器
     * @param {Array<File>} chunks 切好的文件块
    */
    upload(chunks) {
      if (chunks.length === 0) return;
      // 平均分配给每个Worker的任务量
      const workerChunkCount = Math.ceil(chunks.length / this.THREAD_COUNT);
      let finishCount = 0;
      for (let i = 0; i < this.THREAD_COUNT; i++) {
        const worker = new Worker(new URL("../utils/worker.js", import.meta.url), {
          type: "module",
        });
        let startIndex = i * workerChunkCount;
        let endIndex = startIndex + workerChunkCount;
        if (endIndex >= chunks.length) {
          endIndex = chunks.length;
        }
        worker.postMessage({
          chunks,
          startIndex,
          endIndex,
          isUpload: true,
          fileHash: this.fileHash
        });
        worker.onmessage = () => {
          worker.terminate(); // 释放worker
          finishCount++;
          // 全部上传成功后，通知后端合并分片文件
          if (finishCount === this.THREAD_COUNT) {
            const params = {
              fileHash: this.fileHash,
              fileName: this.fileName
            }
            this.mergeChunks(params);
          }
        };
      }
    },

    /**
     * 选择文件
     * @param {Event} e
    */
    async handleUpload(e) {
      const file = e.target.files ? e.target.files[0] : null;
      this.fileName = file && file.name;
      let chunks = await this.cutFile(file);
      let hashPool = ""; // 用每块分片hash值计算出完整的文件Hash值
      chunks.forEach((chunk) => {
        hashPool += chunk.hash;
      });
      this.fileHash = SparkMD5.hash(hashPool);
      console.log('文件Hash: ',this.fileHash);
      console.log('分片集合：', chunks);

      /**
       * checkFileExist做两件事：
       * 1、上传之前先校验文件是否已上传，若已上传则跳过上传并提示上传成功，实现秒传效果；
       * 2、校验文件是否全部上传，若未全部上传，则返回已上传的文件Hash值，前端这边根据返回数据过滤出未上传的文件块，实现断点续传效果；
       */
      const verifyData = await this.checkFileExist(this.fileHash);
      // 如果文件已存在，则后端返回的未上传的文件块的集合值是空数值；具体看对接的后端逻辑调整
      if (verifyData.isExist && verifyData.chunksHash.length === 0) {
        alert("文件已上传成功！");
        return;
      } else {
        // 过滤出未上传的文件块
        chunks = chunks.filter((chunk) => {
          return !verifyData.chunksHash.includes(chunk.hash);
        });
      }

      this.upload(chunks);
    },
    cutFile(file) {
      return new Promise((resolve) => {
        const result = [];
        if (!file) {
          // 处理 file 为空的情况，例如抛出错误或显示默认值
          throw new Error("File is null or undefined.");
        }
        const chunkCount = Math.ceil(file.size / this.CHUNK_SIZE);
        const workerChunkCount = Math.ceil(chunkCount / this.THREAD_COUNT);
        let finishCount = 0;
        for (let i = 0; i < this.THREAD_COUNT; i++) {
          // 通过webWorker减轻主线程的压力，每循环一次都会创建一个新的webWorker
          const worker = new Worker(new URL("../utils/worker.js", import.meta.url), {
            type: "module",
          });
          // 计算每个线程的起始与截止位置
          let startIndex = i * workerChunkCount;
          let endIndex = startIndex + workerChunkCount;
          if (endIndex >= chunkCount) {
            endIndex = chunkCount;
          }
          worker.postMessage({
            file,
            CHUNK_SIZE: this.CHUNK_SIZE,
            startIndex,
            endIndex,
          });
          worker.onmessage = (e) => {
            for (let i = startIndex; i < endIndex; i++) {
              result[i] = e.data[i - startIndex];
            }
            worker.terminate(); // 释放worker
            finishCount++;
            if (finishCount === this.THREAD_COUNT) {
              console.log("所有切片计算完成");
              resolve(result);
            }
          };
        }
      });
    },

    /**
     * 合并分片
     * @param {Object} params
     */
    mergeChunks(params) {
      console.log(params);
      // TODO: 在这里请求后端的合并分片接口，实际参数根据后端接口调整
    },

    /**
     * 校验文件是否已上传
     * @param {String} fileHash 文件hash值
     */
    checkFileExist(fileHash) {
      console.log(fileHash)

      // TODO: 根据后端的接口返回文件是否已上传,实际参数根据后端接口调整
    },
  },
};
</script>

<style></style>
