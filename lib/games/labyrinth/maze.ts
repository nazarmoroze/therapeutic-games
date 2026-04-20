export interface Cell {
  top: boolean // wall exists on this side
  right: boolean
  bottom: boolean
  left: boolean
}

export type Maze = Cell[][]

const OPPOSITE: Record<keyof Cell, keyof Cell> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
}

const DIRS: [number, number, keyof Cell][] = [
  [-1, 0, 'top'],
  [0, 1, 'right'],
  [1, 0, 'bottom'],
  [0, -1, 'left'],
]

// Iterative DFS — no recursion
export function generateMaze(rows: number, cols: number): Maze {
  const maze: Maze = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ top: true, right: true, bottom: true, left: true }))
  )
  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false))
  const stack: [number, number][] = [[0, 0]]
  visited[0][0] = true

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1]
    const neighbors = DIRS.map(
      ([dr, dc, dir]) => [r + dr, c + dc, dir] as [number, number, keyof Cell]
    ).filter(([nr, nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc])

    if (neighbors.length === 0) {
      stack.pop()
    } else {
      const [nr, nc, dir] = neighbors[Math.floor(Math.random() * neighbors.length)]
      maze[r][c][dir] = false
      maze[nr][nc][OPPOSITE[dir]] = false
      visited[nr][nc] = true
      stack.push([nr, nc])
    }
  }
  return maze
}

// BFS — returns ordered path from (sr,sc) → (er,ec)
export function shortestPath(
  maze: Maze,
  sr: number,
  sc: number,
  er: number,
  ec: number
): [number, number][] {
  const rows = maze.length,
    cols = maze[0].length
  const visited = Array.from({ length: rows }, () => new Array(cols).fill(false))
  const parent: ([number, number] | null)[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(null)
  )
  const queue: [number, number][] = [[sr, sc]]
  visited[sr][sc] = true

  outer: while (queue.length > 0) {
    const [r, c] = queue.shift()!
    for (const [dr, dc, dir] of DIRS) {
      if (maze[r][c][dir]) continue
      const nr = r + dr,
        nc = c + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || visited[nr][nc]) continue
      visited[nr][nc] = true
      parent[nr][nc] = [r, c]
      if (nr === er && nc === ec) break outer
      queue.push([nr, nc])
    }
  }

  const path: [number, number][] = []
  let cur: [number, number] | null = [er, ec]
  while (cur) {
    path.unshift(cur)
    const prev: [number, number] | null = parent[cur[0]][cur[1]] as [number, number] | null
    cur = prev
  }
  return path[0]?.[0] === sr && path[0]?.[1] === sc ? path : []
}
