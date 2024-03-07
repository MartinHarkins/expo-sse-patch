import fs from 'fs'
import path from 'path'

// from // from https://github.com/expo/expo/blob/main/packages/%40expo/config-plugins/src/android/Paths.ts
export function getFileInfo(filePath: string) {
  return {
    path: path.normalize(filePath),
    contents: fs.readFileSync(filePath, 'utf8'),
  }
}

/**
 * Replace contents at given start and end offset
 *
 * from https://github.com/expo/expo/blob/main/packages/%40expo/config-plugins/src/utils/commonCodeMod.ts
 *
 * @param contents source contents
 * @param replacement new contents to place in [startOffset:endOffset]
 * @param startOffset `contents` start offset for replacement
 * @param endOffset `contents` end offset for replacement
 * @returns updated contents
 */
export function replaceContentsWithOffset(
  contents: string,
  replacement: string,
  startOffset: number,
  endOffset: number,
): string {
  const contentsLength = contents.length
  if (
    startOffset < 0 ||
    endOffset < 0 ||
    startOffset >= contentsLength ||
    endOffset >= contentsLength ||
    startOffset > endOffset
  ) {
    throw new Error('Invalid parameters.')
  }
  const prefix = contents.substring(0, startOffset)
  const suffix = contents.substring(endOffset + 1)
  return `${prefix}${replacement}${suffix}`
}

// from https://github.com/expo/expo/blob/main/packages/%40expo/config-plugins/src/utils/modules.ts
/**
 * A non-failing version of async FS stat.
 *
 * @param file
 */
async function statAsync(file: string): Promise<fs.Stats | null> {
  try {
    return await fs.promises.stat(file)
  } catch {
    return null
  }
}

export async function directoryExistsAsync(file: string): Promise<boolean> {
  return (await statAsync(file))?.isDirectory() ?? false
}
