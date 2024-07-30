/**
 * 并发任务进行
 * @params {Function[]} tasks 任务总数
 * @params {Number} parallelCount 并发任务数
 */
export function parallelTask(tasks, parallelCount) {
  return new Promise((resolve) => {
    if (tasks.length === 0) {
      resolve();
      return;
    }
    let finishCount = 0; // 记录完成任务量
    let nextIndex = 0; // 下一个任务索引

    function _run() {
      // 运行下一个任务
      const task = tasks[nextIndex];
      nextIndex++;
      task().then(() => {
        finishCount++;
        if (nextIndex < tasks.length) {
          _run();
        } else if (finishCount === tasks.length) {
          // 任务完成
          resolve();
          return;
        }
      })
    }
    for (let i = 0; i < parallelCount && i < tasks.length; i++){
      console.log('i', i)
      _run();
    }
  });
}
