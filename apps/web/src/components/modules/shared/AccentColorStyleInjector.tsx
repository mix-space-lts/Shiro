import { generateAccentColorStyle } from '~/lib/accent-color'

// 内置默认主题色对（浅色/深色一一对应）
const defaultAccentColorPairs: AccentColor[] = [
  // 浅葱 / 桃
  { light: '#33A6B8', dark: '#F596AA' },
  { light: '#FF6666', dark: '#A0A7D4' },
  { light: '#26A69A', dark: '#ff7b7b' },
  { light: '#fb7287', dark: '#99D8CF' },
  { light: '#69a6cc', dark: '#838BC6' },
]

export async function AccentColorStyleInjector({
  color,
}: {
  color?: AccentColor[]
}) {
  // color 是成对数组；过滤掉缺少 light 或 dark 的无效项
  const pairs = (color ?? defaultAccentColorPairs).filter(
    (p): p is AccentColor =>
      !!p &&
      typeof p.light === 'string' &&
      p.light.trim() !== '' &&
      typeof p.dark === 'string' &&
      p.dark.trim() !== '',
  )

  // 兜底：过滤后为空则回退到内置默认色对
  const safePairs = pairs.length > 0 ? pairs : defaultAccentColorPairs

  const randomSeedRef = (Math.random() * safePairs.length) | 0
  const currentPair = safePairs[randomSeedRef] ?? safePairs[0]
  const currentAccentColorLRef = currentPair.light
  const currentAccentColorDRef = currentPair.dark

  const cssContent = await generateAccentColorStyle({
    colors: {
      light: currentAccentColorLRef,
      dark: currentAccentColorDRef,
    },
    useThemedClass: false,
  })

  return (
    <style
      id="accent-color-style"
      data-light={currentAccentColorLRef}
      data-dark={currentAccentColorDRef}
      dangerouslySetInnerHTML={{
        __html: cssContent,
      }}
    />
  )
}
