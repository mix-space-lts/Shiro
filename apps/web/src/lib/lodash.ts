export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number,
  immediate = false,
): ((...args: Parameters<F>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return function (this: any, ...args: Parameters<F>) {
    const doLater = () => {
      timeoutId = undefined
      if (!immediate) {
        func.apply(this, args)
      }
    }

    const shouldCallNow = immediate && timeoutId === undefined

    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(doLater, wait)

    if (shouldCallNow) {
      func.apply(this, args)
    }
  }
}

export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  wait: number,
  options: {
    leading?: boolean
    trailing?: boolean
  } = {},
): ((...args: Parameters<F>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let lastArgs: Parameters<F> | undefined
  let lastCallTime: number | undefined

  const doLater = () => {
    timeoutId = undefined
    if (lastArgs !== undefined) {
      func.apply(this, lastArgs)
      lastArgs = undefined
      lastCallTime = Date.now()
      timeoutId = setTimeout(doLater, wait)
    }
  }

  return function (this: any, ...args: Parameters<F>) {
    const currentTime = Date.now()

    if (lastCallTime === undefined && options.leading === false) {
      lastCallTime = currentTime
    }

    const remainingTime = wait - (currentTime - (lastCallTime ?? 0))

    if (remainingTime <= 0 || remainingTime > wait) {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
      func.apply(this, args)
      lastCallTime = currentTime
      timeoutId = setTimeout(doLater, wait)
    } else if (options.trailing !== false) {
      lastArgs = args
      if (timeoutId === undefined) {
        timeoutId = setTimeout(doLater, remainingTime)
      }
    }
  }
}

export const isUndefined = (val: any): val is undefined => val === undefined

export const cloneDeep = <T>(val: T): T => {
  if (Array.isArray(val)) {
    return val.map(cloneDeep) as any
  } else if (typeof val === 'object' && val !== null) {
    const result: any = {}
    for (const key in val) {
      result[key] = cloneDeep(val[key])
    }
    return result
  } else {
    return val
  }
}

export const range = (start: number, end: number): number[] => {
  const result: number[] = []
  for (let i = start; i < end; i++) {
    result.push(i)
  }
  return result
}

export const sample = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]

export const shuffle = <T>(arr: T[]): T[] => {
  const result = [...arr]
  for (let i = 0; i < result.length; i++) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}

export const isShallowEqualArray = <T>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) {
    return false
  }

  for (const [i, element] of arr1.entries()) {
    if (!Object.is(element, arr2[i])) {
      return false
    }
  }

  return true
}

export const merge = <T extends object, U extends object>(
  ...objs: (T | U)[]
): T & U => {
  const result: any = {}

  for (const obj of objs) {
    for (const key in obj) {
      result[key] = (obj as any)[key]
    }
  }

  return result
}

/**
 * 深度合并配置 (defaultThemeConfig ← source)
 *
 * 规则：
 *   - replace: true → 清除 target 对应键后继续合并（递归处理嵌套 replace）
 *   - 对象：逐键深度合并
 *   - 数组：按 idKey 字段匹配合并（匹配覆盖，无匹配追加，默认 idKey='path'）
 *   - 标量 / target 不存在的键 → 覆盖
 *
 * ⚠️ 此函数依赖 app.default.theme-config.ts 作为完整 schema。
 *    新增配置字段时，需先在 app.default.theme-config.ts 中定义默认值。
 */
export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Record<string, any>,
  opts?: string | { idKey?: string },
): T => {
  const idKey = typeof opts === 'string' ? opts : (opts?.idKey ?? 'path')
  const cleaned = stripReplace(target, source, '', idKey)
  return deepMergeImpl(target, cleaned, '', idKey)
}

/** 合并两个对象数组：source 中带 idKey 的元素覆盖 target 中同 idKey 项，多余项追加 */
function mergeArrays(
  target: Record<string, unknown>[],
  source: Record<string, unknown>[],
  idKey: string,
): Record<string, unknown>[] {
  const result = [...target]
  for (const item of source) {
    const id = item[idKey]
    if (id != null && (typeof id === 'string' || typeof id === 'number')) {
      const idx = result.findIndex((d) => d[idKey] === id)
      if (idx !== -1) {
        result[idx] = { ...result[idx], ...item }
        continue
      }
    }
    result.push(item)
  }
  return result
}

/** 处理 replace 标记：删除 target 中对应 key，递归清理 source 中的 replace */
function stripReplace(
  target: Record<string, any>,
  source: Record<string, any>,
  _path: string,
  idKey: string,
  _parentReplaced = false,
): Record<string, any> {
  // source 自身有 replace: true → 清除 target 所有键
  if (source.replace === true) {
    for (const k of Object.keys(target)) delete target[k]
  }

  const result: Record<string, any> = {}
  for (const key in source) {
    if (key === 'replace') continue

    const sv = source[key]
    const nobj = sv && typeof sv === 'object' && !Array.isArray(sv)

    if (_parentReplaced && nobj && sv.replace === false) {
      console.warn(
        `[Shiro Config] Conflicting "replace: false" at "${_path ? `${_path}.${key}` : key}" — ancestor already has "replace: true". This key will be merged against already-removed defaults, which may produce unexpected results.`,
      )
      const rest = { ...sv }
      delete rest.replace
      result[key] = stripReplace(
        target[key] ?? {},
        rest,
        _path ? `${_path}.${key}` : key,
        idKey,
        _parentReplaced,
      )
      continue
    }

    if (nobj && sv.replace === true) {
      if (_parentReplaced) {
        console.info(
          `[Shiro Config] Redundant "replace: true" at "${_path ? `${_path}.${key}` : key}" — ancestor already has "replace: true", safely ignored.`,
        )
        const rest = { ...sv }
        delete rest.replace
        result[key] = stripReplace(
          target[key] ?? {},
          rest,
          _path ? `${_path}.${key}` : key,
          idKey,
          true,
        )
      } else {
        delete target[key]
        const rest = { ...sv }
        delete rest.replace
        result[key] = stripReplace(
          target[key] ?? {},
          rest,
          _path ? `${_path}.${key}` : key,
          idKey,
          true,
        )
      }
    } else if (Array.isArray(sv)) {
      result[key] = sv.map((elem: any) => {
        if (
          elem &&
          typeof elem === 'object' &&
          !Array.isArray(elem) &&
          elem.replace === true
        ) {
          const eid = elem[idKey]
          if (eid != null && Array.isArray(target[key])) {
            const match = (target[key] as any[]).find(
              (d: any) => d[idKey] === eid,
            )
            if (match) {
              for (const k of Object.keys(match)) {
                if (k !== idKey && typeof match[k] === 'object') {
                  delete match[k]
                }
              }
            }
          }
          const rest = { ...elem }
          delete rest.replace
          return rest
        }
        return elem
      })
    } else if (
      nobj &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = stripReplace(
        target[key],
        sv,
        _path ? `${_path}.${key}` : key,
        idKey,
        _parentReplaced,
      )
    } else {
      result[key] = sv
    }
  }
  return result
}

/** 纯深度合并（无 replace 语义） */
function deepMergeImpl<T extends Record<string, any>>(
  target: T,
  source: Record<string, any>,
  _path: string,
  idKey: string,
): T {
  const result = { ...target }
  for (const key in source) {
    if (key === 'replace') continue

    const currentPath = _path ? `${_path}.${key}` : key
    const sv = source[key]
    const nobj = sv && typeof sv === 'object' && !Array.isArray(sv)

    if (process.env.NODE_ENV === 'development' && !(key in target)) {
      console.warn(
        `[Shiro Config] Unknown config key: "${currentPath}" — this key does not exist in the default theme config. Check your theme snippet for typos or removed fields.`,
      )
    }

    if (
      nobj &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMergeImpl(target[key], sv, currentPath, idKey)
    } else if (Array.isArray(sv) && Array.isArray(target[key])) {
      result[key] = mergeArrays(
        target[key] as Record<string, unknown>[],
        sv as Record<string, unknown>[],
        idKey,
      ) as any
    } else if (sv !== undefined) {
      result[key] = sv as any
    }
  }
  return result
}
export function uniqBy<T, K>(array: T[], iteratee: (item: T) => K): T[] {
  const seen = new Set<K>()
  return array.filter((item) => {
    const key = iteratee(item)
    if (!seen.has(key)) {
      seen.add(key)
      return true
    }
    return false
  })
}

export function get(target: object, path: string) {
  const keys = path.split('.')
  let result = target as any
  for (const key of keys) {
    result = result[key]
    if (result === undefined) {
      return result
    }
  }
  return result
}

export const uniq = <T>(arr: T[]): T[] => Array.from(new Set(arr))

export const omit = <T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> => {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key]
  }
  return result
}
