// 转化时间戳
/**
 * 日期格式化
 * @param Number time 时间戳
 * @param String format 格式  'Y-M-D H:I:S'
 */
export const dateFormat = (time, format) => {
  const t = new Date(time)
  // 日期格式
  format = format || 'Y-m-d h:i:s'
  let year = t.getFullYear()
  // 由于 getMonth 返回值会比正常月份小 1
  let month = t.getMonth() + 1
  let day = t.getDate()
  let hours = t.getHours()
  let minutes = t.getMinutes()
  let seconds = t.getSeconds()

  const hash = {
    y: year,
    m: month,
    d: day,
    h: hours,
    i: minutes,
    s: seconds
  }
  // 是否补 0
  const isAddZero = (o) => {
    return /M|D|H|I|S/.test(o)
  }
  return format.replace(/\w/g, (o) => {
    let rt = hash[o.toLocaleLowerCase()]
    return rt > 10 || !isAddZero(o) ? rt : `0${rt}`
  })
}