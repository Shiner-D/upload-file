# practice

大文件上传实现步骤

1、获取文件信息，进行分片；
function createChunks(file, chunkSize){
	const result = [];
	for(let i = 0; i< file.size; i+= chunkSize) {
		result.push(file.slice(i, i+chunkSize))
	}
	return result;
}

2、计算文件hash值；使用增量算法计算文件hash值，减少内存占用；