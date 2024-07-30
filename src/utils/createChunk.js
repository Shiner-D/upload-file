import SparkMD5 from "spark-md5";

export function createChunks(file, index, chunkSize) {
  return new Promise((resolve) => {
    const start = index * chunkSize;
    const end = start + chunkSize;
    const spark = new SparkMD5();
    const fileReader = new FileReader();
    const blob = file.slice(start, end);
    fileReader.onload = (e) => {
      if (e.target && e.target.result) {
        const result = e.target.result;
        if (typeof result === "string") {
          spark.append(result);
        } else {
          const textDecoder = new TextDecoder();
          spark.append(textDecoder.decode(result));
        }
      }
      resolve({
        start,
        end,
        index,
        hash: spark.end(),
        blob,
      });
    };
    fileReader.readAsArrayBuffer(blob);
  });
}
