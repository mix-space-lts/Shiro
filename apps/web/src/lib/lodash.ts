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

const META_IDKEY = '$idkey'
const META_REPLACE = '$replace'
const DEPRECATED_REPLACE = 'replace'
const DEPRECATED_IDKEY = 'idkey'

/**
 * 深度合并配置 (defaultThemeConfig ← source)
 *
 * 规则：
 *   - $replace: true → 清除 target 对应键后继续合并（递归处理嵌套 $replace）
 *   - 对象：逐键深度合并
 *   - 数组：
 *       - 若默认模板中声明了 $idkey，则按该字段合并（匹配项递归合并，无匹配追加）
 *       - 若无 $idkey，则递归深比较去重（完全相同的元素忽略，其余追加）
 *   - 标量 / target 不存在的键 → 覆盖
 *
 * ⚠️ 此函数依赖 app.default.theme-config.ts 作为完整 schema。
 *    新增配置字段时，需先在 app.default.theme-config.ts 中定义默认值。
 * ⚠️ 用户配置中不应以 $ 开头定义字段，否则属于未定义行为。
 * ⚠️ 旧语法 `replace` / `idkey` 仍被接受，但会 console.warn deprecation，
 *    并自动迁移为 `$replace` / `$idkey`。请尽快迁移用户配置。
 */
export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Record<string, any>,
  opts?: string | { idKey?: string },
): T => {
  const globalIdKey =
    typeof opts === 'string' ? opts : (opts?.idKey ?? undefined)
  const { value: cleanTarget, idKeys } = extractMetaKeys(target)
  const migratedSource = migrateDeprecatedMeta(source, '')
  const cleaned = stripReplace(
    cleanTarget,
    migratedSource,
    '',
    globalIdKey,
    idKeys,
  )
  return deepMergeImpl(cleanTarget, cleaned, '', globalIdKey, idKeys)
}

/**
 * 递归迁移旧语法元键：
 *   - `replace` → `$replace`（若已有 `$replace` 则以 `$replace` 为准，丢弃 `replace`）
 *   - `idkey`  → `$idkey`（同上）
 * 每次迁移都会 console.warn 提示 deprecated。
 */
function migrateDeprecatedMeta(value: any, path: string): any {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (Array.isArray(value)) {
    const arrIdKey = (value as any)[DEPRECATED_IDKEY]
    if (arrIdKey !== undefined && (value as any)[META_IDKEY] === undefined) {
      console.warn(
        `[Shiro Config] Deprecated "idkey" at "${path || '<root>'}" — please rename to "$idkey". Auto-migrating.`,
      )
    }
    return value.map((item, i) => migrateDeprecatedMeta(item, `${path}[${i}]`))
  }

  const result: any = {}
  for (const key of Object.keys(value)) {
    const childPath = path ? `${path}.${key}` : key
    result[key] = migrateDeprecatedMeta(value[key], childPath)
  }

  // 处理对象自身的旧语法 replace
  if (
    Object.prototype.hasOwnProperty.call(value, DEPRECATED_REPLACE) &&
    !Object.prototype.hasOwnProperty.call(value, META_REPLACE)
  ) {
    console.warn(
      `[Shiro Config] Deprecated "replace" at "${path || '<root>'}" — please rename to "$replace". Auto-migrating.`,
    )
    result[META_REPLACE] = value[DEPRECATED_REPLACE]
    delete result[DEPRECATED_REPLACE]
  } else if (
    Object.prototype.hasOwnProperty.call(value, DEPRECATED_REPLACE) &&
    Object.prototype.hasOwnProperty.call(value, META_REPLACE)
  ) {
    console.warn(
      `[Shiro Config] Deprecated "replace" at "${path || '<root>'}" conflicts with "$replace" — ignoring "replace", keeping "$replace".`,
    )
    delete result[DEPRECATED_REPLACE]
  }

  // 处理对象自身的旧语法 idkey（仅当对象同时是数组载体时才有意义，但保守迁移）
  if (
    Object.prototype.hasOwnProperty.call(value, DEPRECATED_IDKEY) &&
    !Object.prototype.hasOwnProperty.call(value, META_IDKEY)
  ) {
    console.warn(
      `[Shiro Config] Deprecated "idkey" at "${path || '<root>'}" — please rename to "$idkey". Auto-migrating.`,
    )
    result[META_IDKEY] = value[DEPRECATED_IDKEY]
    delete result[DEPRECATED_IDKEY]
  } else if (
    Object.prototype.hasOwnProperty.call(value, DEPRECATED_IDKEY) &&
    Object.prototype.hasOwnProperty.call(value, META_IDKEY)
  ) {
    console.warn(
      `[Shiro Config] Deprecated "idkey" at "${path || '<root>'}" conflicts with "$idkey" — ignoring "idkey", keeping "$idkey".`,
    )
    delete result[DEPRECATED_IDKEY]
  }

  return result
}

/** 创建 extractMetaKeys 用的 meta 对象（避免对象字面量作为默认参数导致共享可变状态） */
const createMeta = (): { idKeys: Record<string, string> } => ({ idKeys: {} })

/**
 * 从默认模板中提取元键：
 *   - 数组上的 $idkey 表示该数组的合并键
 * 返回剥离元键后的干净模板及 idKey 映射表。
 */
function extractMetaKeys(
  value: any,
  path = '',
  meta: { idKeys: Record<string, string> } = createMeta(),
): { value: any; idKeys: Record<string, string> } {
  if (value === null || typeof value !== 'object') {
    return { value, idKeys: meta.idKeys }
  }

  if (Array.isArray(value)) {
    const arrIdKey = (value as any)[META_IDKEY]
    if (typeof arrIdKey === 'string') {
      meta.idKeys[path] = arrIdKey
    }
    const result = value.map(
      (item, i) => extractMetaKeys(item, `${path}[${i}]`, meta).value,
    )
    return { value: result, idKeys: meta.idKeys }
  }

  const result: any = {}
  for (const key of Object.keys(value)) {
    if (key === META_IDKEY || key === META_REPLACE) {
      // 元键不属于最终配置，不复制到干净模板中
      continue
    }
    const childPath = path ? `${path}.${key}` : key
    const { value: childValue } = extractMetaKeys(value[key], childPath, meta)
    result[key] = childValue
  }
  return { value: result, idKeys: meta.idKeys }
}

/** 递归深比较：对象 key 顺序无关，数组顺序有关。 */
function isDeepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a !== typeof b) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false
    }
    return true
  }

  if (typeof a === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    for (const key of keysA) {
      if (!Object.hasOwn(b, key)) return false
      if (!isDeepEqual(a[key], b[key])) return false
    }
    return true
  }

  return false
}

/** 选择当前数组使用的 idKey：显式传入 > 默认模板中声明的 $idkey > undefined */
function resolveIdKey(
  path: string,
  explicitIdKey: string | undefined,
  idKeys: Record<string, string>,
): string | undefined {
  return explicitIdKey ?? idKeys[path]
}

/** 合并两个数组：有 idKey 则按 idKey 合并，否则深比较去重。 */
function mergeArrays(
  target: any[],
  source: any[],
  path: string,
  explicitIdKey: string | undefined,
  idKeys: Record<string, string>,
): any[] {
  const idKey = resolveIdKey(path, explicitIdKey, idKeys)
  const result = [...target]

  for (const item of source) {
    if (
      idKey &&
      item &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      item[idKey] != null
    ) {
      const id = item[idKey]
      const idx = result.findIndex(
        (d) =>
          d && typeof d === 'object' && !Array.isArray(d) && d[idKey] === id,
      )
      if (idx !== -1) {
        result[idx] = deepMergeImpl(
          result[idx],
          item,
          `${path}[${idx}]`,
          explicitIdKey,
          idKeys,
        )
        continue
      }
    }

    if (!result.some((existing) => isDeepEqual(existing, item))) {
      result.push(item)
    }
  }

  return result
}

/** 处理 $replace 标记：删除 target 中对应 key，递归清理 source 中的 $replace */
function stripReplace(
  target: Record<string, any>,
  source: Record<string, any>,
  _path: string,
  idKey: string | undefined,
  idKeys: Record<string, string>,
  _parentReplaced = false,
): Record<string, any> {
  // source 自身有 $replace: true → 清除 target 所有键
  if (source[META_REPLACE] === true) {
    for (const k of Object.keys(target)) delete target[k]
  }

  const result: Record<string, any> = {}
  for (const key in source) {
    if (key === META_REPLACE) continue

    const sv = source[key]
    const nobj = sv && typeof sv === 'object' && !Array.isArray(sv)

    if (_parentReplaced && nobj && sv[META_REPLACE] === false) {
      console.warn(
        `[Shiro Config] Conflicting "${META_REPLACE}: false" at "${_path ? `${_path}.${key}` : key}" — ancestor already has "${META_REPLACE}: true". This key will be merged against already-removed defaults, which may produce unexpected results.`,
      )
      const rest = { ...sv }
      delete rest[META_REPLACE]
      result[key] = stripReplace(
        target[key] ?? {},
        rest,
        _path ? `${_path}.${key}` : key,
        idKey,
        idKeys,
        _parentReplaced,
      )
      continue
    }

    if (nobj && sv[META_REPLACE] === true) {
      if (_parentReplaced) {
        console.info(
          `[Shiro Config] Redundant "${META_REPLACE}: true" at "${_path ? `${_path}.${key}` : key}" — ancestor already has "${META_REPLACE}: true", safely ignored.`,
        )
      } else {
        delete target[key]
      }
      const rest = { ...sv }
      delete rest[META_REPLACE]
      result[key] = stripReplace(
        target[key] ?? {},
        rest,
        _path ? `${_path}.${key}` : key,
        idKey,
        idKeys,
        true,
      )
    } else if (Array.isArray(sv)) {
      const currentPath = _path ? `${_path}.${key}` : key
      const itemIdKey = resolveIdKey(currentPath, idKey, idKeys)

      // 先扫描：是否存在 {$replace: true} 且无 idKey 字段的"清除整个数组"标记
      // 该标记必须是纯标记（删除 $replace 后无其他字段），否则视为普通元素
      const arrayResetMarkerIdx = sv.findIndex(
        (elem) =>
          elem &&
          typeof elem === 'object' &&
          !Array.isArray(elem) &&
          elem[META_REPLACE] === true &&
          (itemIdKey ? elem[itemIdKey] == null : true) &&
          Object.keys(elem).every((k) => k === META_REPLACE),
      )

      if (arrayResetMarkerIdx !== -1) {
        // 清除整个 target 数组（用空数组占位，后续 flatMap 追加 source 其余元素）
        if (Array.isArray(target[key])) {
          ;(target[key] as any[]).length = 0
        }
        console.warn(
          `[Shiro Config] "$replace: true" marker at "${currentPath}[${arrayResetMarkerIdx}]" — clearing entire default array. Subsequent elements will be appended from scratch.`,
        )
      }

      result[key] = sv.flatMap((elem: any, idx: number) => {
        // 跳过"清除整个数组"标记本身
        if (idx === arrayResetMarkerIdx) {
          return []
        }

        if (
          elem &&
          typeof elem === 'object' &&
          !Array.isArray(elem) &&
          elem[META_REPLACE] === true
        ) {
          const eid = itemIdKey ? elem[itemIdKey] : undefined
          if (eid != null && itemIdKey && Array.isArray(target[key])) {
            const match = (target[key] as any[]).find(
              (d: any) => d && d[itemIdKey] === eid,
            )
            if (match) {
              for (const k of Object.keys(match)) {
                if (k !== itemIdKey && typeof match[k] === 'object') {
                  delete match[k]
                }
              }
            }
          }
          const rest = { ...elem }
          delete rest[META_REPLACE]
          // $replace: true 但无 idKey（无法匹配默认项）且元素有其他内容
          // → $replace 无意义，保留元素并 warn
          if (eid == null && Object.keys(rest).length > 0) {
            console.warn(
              `[Shiro Config] "$replace: true" at "${currentPath}[${idx}]" has no "${itemIdKey ?? 'idKey'}" — cannot match any default item. "$replace" is ignored, keeping the element as-is.`,
            )
          }
          return [rest]
        }
        return [elem]
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
        idKeys,
        _parentReplaced,
      )
    } else {
      result[key] = sv
    }
  }
  return result
}

/** 纯深度合并（无 $replace 语义） */
function deepMergeImpl(
  target: any,
  source: any,
  _path: string,
  idKey: string | undefined,
  idKeys: Record<string, string>,
): any {
  if (source === undefined) return target
  if (target === undefined) return source

  if (Array.isArray(source) && Array.isArray(target)) {
    return mergeArrays(target, source, _path, idKey, idKeys)
  }

  if (
    typeof source !== 'object' ||
    source === null ||
    typeof target !== 'object' ||
    target === null
  ) {
    return source
  }

  const result = { ...target } as Record<string, any>
  for (const key in source) {
    if (key === META_REPLACE) continue

    const currentPath = _path ? `${_path}.${key}` : key
    const sv = source[key]

    if (process.env.NODE_ENV === 'development' && !(key in target)) {
      console.warn(
        `[Shiro Config] Unknown config key: "${currentPath}" — this key does not exist in the default theme config. Check your theme snippet for typos or removed fields.`,
      )
    }

    if (key in result) {
      result[key] = deepMergeImpl(result[key], sv, currentPath, idKey, idKeys)
    } else {
      result[key] = sv
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
