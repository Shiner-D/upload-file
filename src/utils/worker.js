import { parallelTask } from "./parallelTask.js";

onmessage = async (e) => {
    // 上传文件时的处理
    if (e.data.isUpload) {
        const { chunks, startIndex, endIndex, fileHash } = e.data;
        const proms = []; // 存放任务
        // 模拟调用上传接口
        const formData = new FormData();
        for (let i = startIndex; i < endIndex; i++) {
            formData.append("file", chunks[startIndex].blob);
            formData.append("fileHash", fileHash);
            formData.append("fileChunkHash", chunks[startIndex].hash)
            formData.append("fileChunkIndex", i);
            proms.push(uploadFile(formData))
        }
        await parallelTask(proms, 5);
    } else {
        // 获取文件分片hash值
        const { createChunks } = await import("../utils/createChunk.js");
        const proms = [];
        const { file, CHUNK_SIZE, startIndex, endIndex } = e.data;
        for (let i = startIndex; i < endIndex; i++) {
            proms.push(createChunks(file, i, CHUNK_SIZE));
        }
        const chunks = await Promise.all(proms);
        postMessage(chunks);
    }
};

// 模拟的接口，实际用后端提供的接口
function uploadFile(formData) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:3000/upload", true);
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error(xhr.statusText));
        }
      };
      xhr.onerror = () => {
        reject(new Error("Network Error"));
      };
      xhr.send(formData); // 直接将 formData 作为参数传递
    })
}