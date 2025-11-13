from collections import deque

def rotate_90_clockwise(x, y):
    """Rotate (x, y) 90 degrees clockwise"""
    return (y, -x)

def rotate_90_anticlockwise(x, y):
    """Rotate (x, y) 90 degrees anticlockwise"""
    return (-y, x)

def rotate_180(x, y):
    """Rotate (x, y) 180 degrees"""
    return (-x, -y)

def get_next_positions(current_x, current_y, move_x, move_y, M, N):
    """Get all valid next positions from current position"""
    directions = []
    
    # Forward: add move rule directly
    forward_x = current_x + move_x
    forward_y = current_y + move_y
    directions.append((forward_x, forward_y))
    
    # Right: rotate move rule 90 degrees clockwise
    right_move_x, right_move_y = rotate_90_clockwise(move_x, move_y)
    right_x = current_x + right_move_x
    right_y = current_y + right_move_y
    directions.append((right_x, right_y))
    
    # Left: rotate move rule 90 degrees anticlockwise
    left_move_x, left_move_y = rotate_90_anticlockwise(move_x, move_y)
    left_x = current_x + left_move_x
    left_y = current_y + left_move_y
    directions.append((left_x, left_y))
    
    # Backward: rotate move rule 180 degrees
    back_move_x, back_move_y = rotate_180(move_x, move_y)
    back_x = current_x + back_move_x
    back_y = current_y + back_move_y
    directions.append((back_x, back_y))
    
    # Filter valid positions within grid bounds
    valid_positions = []
    for x, y in directions:
        if 0 <= x < M and 0 <= y < N:
            valid_positions.append((x, y))
    
    return valid_positions

def solve_grid_game(M, N, grid, source, destination, move_rule):
    """Find minimum moves to reach destination using BFS"""
    source_x, source_y = source
    dest_x, dest_y = destination
    move_x, move_y = move_rule
    
    # Check if source or destination is blocked
    if grid[source_x][source_y] == 1 or grid[dest_x][dest_y] == 1:
        return -1
    
    # If source is same as destination
    if source_x == dest_x and source_y == dest_y:
        return 0
    
    # BFS setup
    queue = deque([(source_x, source_y, 0)])  # (x, y, moves)
    visited = [[False for _ in range(N)] for _ in range(M)]
    visited[source_x][source_y] = True
    
    while queue:
        current_x, current_y, moves = queue.popleft()
        
        # Get all valid next positions
        next_positions = get_next_positions(current_x, current_y, move_x, move_y, M, N)
        
        for next_x, next_y in next_positions:
            # Check if position is valid (within bounds and not blocked)
            if 0 <= next_x < M and 0 <= next_y < N and grid[next_x][next_y] == 0:
                if not visited[next_x][next_y]:
                    visited[next_x][next_y] = True
                    
                    # Check if we reached destination
                    if next_x == dest_x and next_y == dest_y:
                        return moves + 1
                    
                    queue.append((next_x, next_y, moves + 1))
    
    return -1  # Destination not reachable

def main():
    # Read input
    M, N = map(int, input().split())
    
    grid = []
    for _ in range(M):
        row = list(map(int, input().split()))
        grid.append(row)
    
    source_x, source_y = map(int, input().split())
    dest_x, dest_y = map(int, input().split())
    move_x, move_y = map(int, input().split())
    
    result = solve_grid_game(M, N, grid, (source_x, source_y), (dest_x, dest_y), (move_x, move_y))
    print(result)

if __name__ == "__main__":
    main()
