export function incrementSetIfNotPresent(map, key) {
    if (map.has(key)) {
        map.set(key, map.get(key) + 1);
    } else {
        map.set(key, 1);
    }
}

export function decrementDeleteIfZero(map, key) {
    if (map.has(key)) {
        map.set(key, map.get(key) - 1);
    }

    if (map.get(key) === 0) {
        map.delete(key);
    }
}